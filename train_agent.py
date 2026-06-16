"""
Deep Reinforcement Learning Training Script for KMRL Metro System

This script implements PPO (Proximal Policy Optimization) training for the multi-train
scheduling environment using Stable Baselines3.

Features:
- Configurable training parameters
- Model checkpointing and saving
- Progress monitoring with TensorBoard
- Multiple training scenarios
- Performance evaluation during training

Author: KMRL Development Team
Version: 1.0.0
"""

import os
import sys
import argparse
import logging
import json
import numpy as np
from datetime import datetime
from typing import Dict, Optional, Tuple

import torch
from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env
from stable_baselines3.common.vec_env import SubprocVecEnv, DummyVecEnv
from stable_baselines3.common.callbacks import (
    EvalCallback, 
    CheckpointCallback,
    StopTrainingOnRewardThreshold,
    CallbackList
)
from stable_baselines3.common.monitor import Monitor
from stable_baselines3.common.logger import configure
import gymnasium as gym

from metro_env import KMRLMetroEnvironment, create_environment_config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('training.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class TrainingConfig:
    """Configuration class for training parameters"""
    
    def __init__(self, config_dict: Optional[Dict] = None):
        """Initialize with default values, override with config_dict if provided"""
        
        # Default training parameters
        self.total_timesteps = 500000
        self.learning_rate = 3e-4
        self.n_steps = 2048
        self.batch_size = 64
        self.n_epochs = 10
        self.gamma = 0.99
        self.gae_lambda = 0.95
        self.clip_range = 0.2
        self.ent_coef = 0.01
        self.vf_coef = 0.5
        self.max_grad_norm = 0.5
        
        # Environment parameters
        self.n_envs = 4  # Number of parallel environments
        self.scenario = "standard"
        self.env_kwargs = {}
        
        # Training infrastructure
        self.model_save_path = "models/"
        self.tensorboard_log = "tensorboard_logs/"
        self.checkpoint_freq = 50000
        self.eval_freq = 10000
        self.eval_episodes = 10
        self.save_freq = 25000
        
        # Performance thresholds
        self.target_reward = 0.8  # Stop training when mean reward reaches this
        self.early_stopping_patience = 100000  # Steps without improvement
        
        # Override with provided config
        if config_dict:
            for key, value in config_dict.items():
                if hasattr(self, key):
                    setattr(self, key, value)
                else:
                    logger.warning(f"Unknown config parameter: {key}")


def create_training_environment(config: TrainingConfig, rank: int = 0) -> gym.Env:
    """
    Create a single training environment
    
    Args:
        config: Training configuration
        rank: Environment rank for parallel training
        
    Returns:
        Wrapped environment ready for training
    """
    def _init():
        # Create environment configuration
        env_config = create_environment_config(config.scenario, **config.env_kwargs)
        
        # Create environment
        env = KMRLMetroEnvironment(**env_config)
        
        # Wrap with Monitor for logging
        log_dir = os.path.join(config.tensorboard_log, f"env_{rank}")
        os.makedirs(log_dir, exist_ok=True)
        env = Monitor(env, log_dir)
        
        return env
    
    return _init


def setup_callbacks(config: TrainingConfig, eval_env) -> CallbackList:
    """
    Setup training callbacks for monitoring and checkpointing
    
    Args:
        config: Training configuration
        eval_env: Evaluation environment
        
    Returns:
        List of configured callbacks
    """
    callbacks = []
    
    # Checkpoint callback - save model periodically
    checkpoint_callback = CheckpointCallback(
        save_freq=config.checkpoint_freq,
        save_path=config.model_save_path,
        name_prefix="kmrl_ppo_checkpoint"
    )
    callbacks.append(checkpoint_callback)
    
    # Evaluation callback - evaluate model performance
    eval_callback = EvalCallback(
        eval_env,
        best_model_save_path=config.model_save_path,
        log_path=config.tensorboard_log,
        eval_freq=config.eval_freq,
        n_eval_episodes=config.eval_episodes,
        deterministic=True,
        render=False
    )
    callbacks.append(eval_callback)
    
    # Stop training when target reward is reached
    if config.target_reward > 0:
        stop_callback = StopTrainingOnRewardThreshold(
            reward_threshold=config.target_reward,
            verbose=1
        )
        callbacks.append(stop_callback)
    
    return CallbackList(callbacks)


def create_ppo_model(env, config: TrainingConfig) -> PPO:
    """
    Create and configure PPO model
    
    Args:
        env: Training environment
        config: Training configuration
        
    Returns:
        Configured PPO model
    """
    # PPO hyperparameters
    model_params = {
        "policy": "MlpPolicy",
        "env": env,
        "learning_rate": config.learning_rate,
        "n_steps": config.n_steps,
        "batch_size": config.batch_size,
        "n_epochs": config.n_epochs,
        "gamma": config.gamma,
        "gae_lambda": config.gae_lambda,
        "clip_range": config.clip_range,
        "ent_coef": config.ent_coef,
        "vf_coef": config.vf_coef,
        "max_grad_norm": config.max_grad_norm,
        "tensorboard_log": config.tensorboard_log,
        "verbose": 1,
        "device": "auto"  # Use GPU if available
    }
    
    # Create model
    model = PPO(**model_params)
    
    # Configure custom network architecture if needed
    logger.info(f"Created PPO model with policy network architecture:")
    logger.info(f"  - Observation space: {env.observation_space}")
    logger.info(f"  - Action space: {env.action_space}")
    
    return model


def evaluate_model(model: PPO, env, n_episodes: int = 10) -> Dict[str, float]:
    """
    Evaluate trained model performance
    
    Args:
        model: Trained PPO model
        env: Evaluation environment
        n_episodes: Number of episodes to evaluate
        
    Returns:
        Dictionary of evaluation metrics
    """
    logger.info(f"Evaluating model over {n_episodes} episodes...")
    
    episode_rewards = []
    episode_lengths = []
    passenger_satisfaction_scores = []
    energy_efficiency_scores = []
    
    for episode in range(n_episodes):
        obs, _ = env.reset()
        episode_reward = 0
        episode_length = 0
        done = False
        
        while not done:
            action, _ = model.predict(obs, deterministic=True)
            obs, reward, terminated, truncated, info = env.step(action)
            episode_reward += reward
            episode_length += 1
            done = terminated or truncated
            
            # Extract performance metrics from the last step
            if done and "performance_history" in info:
                perf_hist = info["performance_history"]
                if perf_hist["passenger_satisfaction"]:
                    passenger_satisfaction_scores.append(
                        np.mean(perf_hist["passenger_satisfaction"])
                    )
                if perf_hist["energy_efficiency"]:
                    energy_efficiency_scores.append(
                        np.mean(perf_hist["energy_efficiency"])
                    )
        
        episode_rewards.append(episode_reward)
        episode_lengths.append(episode_length)
        
        if (episode + 1) % max(1, n_episodes // 5) == 0:
            logger.info(f"  Episode {episode + 1}/{n_episodes} completed")
    
    # Calculate evaluation metrics
    metrics = {
        "mean_episode_reward": np.mean(episode_rewards),
        "std_episode_reward": np.std(episode_rewards),
        "mean_episode_length": np.mean(episode_lengths),
        "mean_passenger_satisfaction": np.mean(passenger_satisfaction_scores) if passenger_satisfaction_scores else 0.0,
        "mean_energy_efficiency": np.mean(energy_efficiency_scores) if energy_efficiency_scores else 0.0
    }
    
    logger.info("Evaluation Results:")
    for metric, value in metrics.items():
        logger.info(f"  {metric}: {value:.4f}")
    
    return metrics


def save_training_results(model: PPO, config: TrainingConfig, metrics: Dict[str, float]):
    """
    Save trained model and training results
    
    Args:
        model: Trained PPO model
        config: Training configuration used
        metrics: Evaluation metrics
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Create save directory
    save_dir = os.path.join(config.model_save_path, f"kmrl_ppo_{timestamp}")
    os.makedirs(save_dir, exist_ok=True)
    
    # Save model
    model_path = os.path.join(save_dir, "model.zip")
    model.save(model_path)
    logger.info(f"Model saved to: {model_path}")
    
    # Save configuration
    config_path = os.path.join(save_dir, "config.json")
    config_dict = {k: v for k, v in config.__dict__.items() 
                   if not callable(v) and not k.startswith('_')}
    with open(config_path, 'w') as f:
        json.dump(config_dict, f, indent=2)
    
    # Save evaluation metrics
    metrics_path = os.path.join(save_dir, "metrics.json")
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    
    logger.info(f"Training results saved to: {save_dir}")
    return save_dir


def load_config_from_file(config_path: str) -> TrainingConfig:
    """Load training configuration from JSON file"""
    with open(config_path, 'r') as f:
        config_dict = json.load(f)
    return TrainingConfig(config_dict)


def main():
    """Main training function"""
    parser = argparse.ArgumentParser(description="Train KMRL Metro RL Agent")
    parser.add_argument("--config", type=str, help="Path to configuration JSON file")
    parser.add_argument("--scenario", type=str, default="standard", 
                       choices=["standard", "rush_hour", "accessibility_focus"],
                       help="Training scenario")
    parser.add_argument("--timesteps", type=int, default=500000,
                       help="Total training timesteps")
    parser.add_argument("--n_envs", type=int, default=4,
                       help="Number of parallel environments")
    parser.add_argument("--save_path", type=str, default="models/",
                       help="Path to save trained models")
    parser.add_argument("--tensorboard", type=str, default="tensorboard_logs/",
                       help="TensorBoard log directory")
    parser.add_argument("--eval_only", action="store_true",
                       help="Only evaluate existing model (requires --model_path)")
    parser.add_argument("--model_path", type=str,
                       help="Path to existing model for evaluation")
    
    args = parser.parse_args()
    
    # Load or create configuration
    if args.config:
        config = load_config_from_file(args.config)
    else:
        config = TrainingConfig()
        
    # Override config with command line arguments
    if args.scenario:
        config.scenario = args.scenario
    if args.timesteps:
        config.total_timesteps = args.timesteps
    if args.n_envs:
        config.n_envs = args.n_envs
    if args.save_path:
        config.model_save_path = args.save_path
    if args.tensorboard:
        config.tensorboard_log = args.tensorboard
    
    logger.info("="*60)
    logger.info("KMRL Metro Deep RL Training")
    logger.info("="*60)
    logger.info(f"Scenario: {config.scenario}")
    logger.info(f"Total timesteps: {config.total_timesteps:,}")
    logger.info(f"Parallel environments: {config.n_envs}")
    logger.info(f"Device: {'GPU' if torch.cuda.is_available() else 'CPU'}")
    
    # Create directories
    os.makedirs(config.model_save_path, exist_ok=True)
    os.makedirs(config.tensorboard_log, exist_ok=True)
    
    if args.eval_only:
        # Evaluation mode
        if not args.model_path:
            raise ValueError("Model path required for evaluation mode")
        
        logger.info("Running evaluation mode...")
        
        # Create single environment for evaluation
        env_config = create_environment_config(config.scenario, **config.env_kwargs)
        eval_env = KMRLMetroEnvironment(**env_config)
        
        # Load model
        model = PPO.load(args.model_path, env=eval_env)
        
        # Evaluate
        metrics = evaluate_model(model, eval_env, n_episodes=20)
        
        # Save evaluation results
        eval_dir = os.path.dirname(args.model_path)
        eval_path = os.path.join(eval_dir, "evaluation_results.json")
        with open(eval_path, 'w') as f:
            json.dump(metrics, f, indent=2)
        
        logger.info(f"Evaluation results saved to: {eval_path}")
        
    else:
        # Training mode
        logger.info("Starting training...")
        
        try:
            # Create training environments
            if config.n_envs > 1:
                env = make_vec_env(
                    create_training_environment(config),
                    n_envs=config.n_envs,
                    vec_env_cls=SubprocVecEnv,
                    vec_env_kwargs={"start_method": "spawn"}
                )
            else:
                env_init = create_training_environment(config, 0)
                env = DummyVecEnv([env_init])
            
            # Create evaluation environment
            env_config = create_environment_config(config.scenario, **config.env_kwargs)
            eval_env = Monitor(KMRLMetroEnvironment(**env_config))
            
            # Create PPO model
            model = create_ppo_model(env, config)
            
            # Setup callbacks
            callbacks = setup_callbacks(config, eval_env)
            
            # Start training
            logger.info("Beginning PPO training...")
            start_time = datetime.now()
            
            model.learn(
                total_timesteps=config.total_timesteps,
                callback=callbacks,
                progress_bar=True
            )
            
            end_time = datetime.now()
            training_duration = end_time - start_time
            
            logger.info(f"Training completed in {training_duration}")
            
            # Final evaluation
            logger.info("Performing final evaluation...")
            final_metrics = evaluate_model(model, eval_env, n_episodes=20)
            
            # Save results
            save_dir = save_training_results(model, config, final_metrics)
            
            logger.info("="*60)
            logger.info("Training Summary:")
            logger.info(f"  Total timesteps: {config.total_timesteps:,}")
            logger.info(f"  Training duration: {training_duration}")
            logger.info(f"  Final mean reward: {final_metrics['mean_episode_reward']:.4f}")
            logger.info(f"  Model saved to: {save_dir}")
            logger.info("="*60)
            
            # Cleanup
            env.close()
            eval_env.close()
            
        except KeyboardInterrupt:
            logger.info("Training interrupted by user")
            if 'model' in locals():
                emergency_save = os.path.join(config.model_save_path, "emergency_save.zip")
                model.save(emergency_save)
                logger.info(f"Emergency model save: {emergency_save}")
        
        except Exception as e:
            logger.error(f"Training failed: {str(e)}")
            raise


if __name__ == "__main__":
    main()