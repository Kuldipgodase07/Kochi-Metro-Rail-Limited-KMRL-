
from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env
from stable_baselines3.common.callbacks import EvalCallback, StopTrainingOnRewardThreshold
from env import KMRLSchedulingEnv
import os
from datetime import datetime, timedelta
# Load environment variables from .env if present
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

def train_rl_agent(episodes=50000, num_trains=25, target_date=None):
    """
    Train RL agent with enhanced SIH parameters and real database data
    """
    # Use current date if not specified
    if target_date is None:
        target_date = datetime.now().strftime("%Y-%m-%d")
    
    # Create environment with real database data
    env = KMRLSchedulingEnv(num_trains=num_trains, target_date=target_date)
    
    # Create vectorized environment for better training
    vec_env = make_vec_env(lambda: KMRLSchedulingEnv(num_trains=num_trains, target_date=target_date), n_envs=4)
    
    # Create evaluation environment
    eval_env = KMRLSchedulingEnv(num_trains=num_trains, target_date=target_date)
    
    # Configure PPO with optimized hyperparameters for scheduling
    model = PPO(
        "MlpPolicy", 
        vec_env, 
        verbose=1,
        learning_rate=3e-4,
        n_steps=2048,
        batch_size=64,
        n_epochs=10,
        gamma=0.99,
        gae_lambda=0.95,
        clip_range=0.2,
        ent_coef=0.01,
        vf_coef=0.5,
        max_grad_norm=0.5,
        tensorboard_log="./tensorboard_logs/"
    )
    
    # Setup callbacks for training monitoring
    eval_callback = EvalCallback(
        eval_env, 
        best_model_save_path='./best_model/',
        log_path='./eval_logs/', 
        eval_freq=10000,
        deterministic=True, 
        render=False
    )
    
    # Train the model
    print(f"Training RL agent for {episodes} episodes...")
    print(f"Target date: {target_date}")
    print(f"Number of trains: {num_trains}")
    print("SIH Parameters: Fitness Certificates, Job Cards, Branding, Mileage, Cleaning, Stabling")
    
    model.learn(
        total_timesteps=episodes,
        callback=eval_callback,
        tb_log_name="kmrl_scheduling"
    )
    
    # Save the trained model
    model.save("kmrl_rl_agent")
    print("RL agent trained and saved to kmrl_rl_agent.zip")
    
    # Close environments
    env.close()
    vec_env.close()
    eval_env.close()
    
    return model

def train_with_multiple_dates():
    """Train with multiple dates to improve generalization"""
    dates = []
    for i in range(30):  # Train on last 30 days
        date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
        dates.append(date)
    
    print(f"Training on {len(dates)} different dates for better generalization")
    
    # Train on the most recent date first
    model = train_rl_agent(episodes=20000, target_date=dates[0])
    
    # Fine-tune on other dates
    for date in dates[1:5]:  # Fine-tune on 4 additional dates
        print(f"Fine-tuning on date: {date}")
        env = make_vec_env(lambda: KMRLSchedulingEnv(target_date=date), n_envs=4)
        model = PPO.load("kmrl_rl_agent.zip", env=env)
        model.learn(total_timesteps=5000)
        env.close()
    
    model.save("kmrl_rl_agent_final")
    print("Final RL agent saved to kmrl_rl_agent_final.zip")

if __name__ == "__main__":
    # Train with multiple dates for better generalization
    train_with_multiple_dates()