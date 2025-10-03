"""
Testing and Evaluation Script for KMRL Deep RL Agent

This script provides comprehensive testing and evaluation capabilities for the trained
PPO agent, including performance visualization, scenario testing, and result analysis.

Features:
- Load and test trained models
- Performance visualization and reporting
- Scenario-based testing
- Real-time environment rendering
- Statistical analysis of results
- Export capabilities for results

Author: KMRL Development Team
Version: 1.0.0
"""

import os
import sys
import argparse
import json
import logging
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import warnings

import torch
from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env

from metro_env import KMRLMetroEnvironment, create_environment_config, PassengerType

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

# Configure plotting style
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class AgentTester:
    """
    Comprehensive testing suite for the KMRL RL Agent
    """
    
    def __init__(self, model_path: str, scenarios: List[str] = None):
        """
        Initialize the agent tester
        
        Args:
            model_path: Path to the trained model
            scenarios: List of scenarios to test
        """
        self.model_path = model_path
        self.scenarios = scenarios or ["standard", "rush_hour", "accessibility_focus"]
        self.results = {}
        
        # Load model (will load environment when needed)
        self.model = None
        self._load_model()
        
        logger.info(f"AgentTester initialized with model: {model_path}")
    
    def _load_model(self):
        """Load the trained model"""
        try:
            # Create a temporary environment to load the model
            temp_env_config = create_environment_config("standard")
            temp_env = KMRLMetroEnvironment(**temp_env_config)
            
            self.model = PPO.load(self.model_path, env=temp_env)
            logger.info("Model loaded successfully")
            
            temp_env.close()
            
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            raise
    
    def run_scenario_tests(self, episodes_per_scenario: int = 20) -> Dict[str, Dict]:
        """
        Run comprehensive testing across multiple scenarios
        
        Args:
            episodes_per_scenario: Number of episodes to run per scenario
            
        Returns:
            Dictionary of results for each scenario
        """
        logger.info(f"Running scenario tests with {episodes_per_scenario} episodes each")
        
        all_results = {}
        
        for scenario in self.scenarios:
            logger.info(f"Testing scenario: {scenario}")
            
            # Create environment for this scenario
            env_config = create_environment_config(scenario)
            env = KMRLMetroEnvironment(**env_config, render_mode=None)
            
            # Run episodes
            scenario_results = self._run_episodes(env, episodes_per_scenario, scenario)
            all_results[scenario] = scenario_results
            
            env.close()
            
            logger.info(f"Scenario {scenario} completed")
        
        self.results = all_results
        return all_results
    
    def _run_episodes(self, env: KMRLMetroEnvironment, n_episodes: int, scenario: str) -> Dict:
        """Run multiple episodes and collect detailed statistics"""
        
        episode_data = []
        step_data = []
        
        for episode in range(n_episodes):
            obs, info = env.reset()
            episode_reward = 0
            episode_steps = 0
            done = False
            
            # Track episode metrics
            passenger_satisfaction_history = []
            energy_efficiency_history = []
            schedule_adherence_history = []
            passengers_served = 0
            
            while not done:
                # Get action from trained agent
                action, _ = self.model.predict(obs, deterministic=True)
                obs, reward, terminated, truncated, info = env.step(action)
                
                episode_reward += reward
                episode_steps += 1
                done = terminated or truncated
                
                # Collect step-level data
                if "performance_history" in info:
                    perf_hist = info["performance_history"]
                    
                    if perf_hist["passenger_satisfaction"]:
                        passenger_satisfaction_history.extend(perf_hist["passenger_satisfaction"])
                    if perf_hist["energy_efficiency"]:
                        energy_efficiency_history.extend(perf_hist["energy_efficiency"])
                    if perf_hist["schedule_adherence"]:
                        schedule_adherence_history.extend(perf_hist["schedule_adherence"])
                    
                    passengers_served = perf_hist.get("total_passengers_served", 0)
                
                # Store step data
                step_data.append({
                    "scenario": scenario,
                    "episode": episode,
                    "step": episode_steps,
                    "reward": reward,
                    "total_passengers_waiting": info.get("total_passengers_waiting", 0),
                    "active_trains": info.get("active_trains", 0),
                    "average_energy": info.get("average_energy", 0)
                })
            
            # Store episode data
            episode_data.append({
                "scenario": scenario,
                "episode": episode,
                "total_reward": episode_reward,
                "episode_length": episode_steps,
                "passengers_served": passengers_served,
                "mean_passenger_satisfaction": np.mean(passenger_satisfaction_history) if passenger_satisfaction_history else 0,
                "mean_energy_efficiency": np.mean(energy_efficiency_history) if energy_efficiency_history else 0,
                "mean_schedule_adherence": np.mean(schedule_adherence_history) if schedule_adherence_history else 0
            })
            
            # Progress logging
            if (episode + 1) % max(1, n_episodes // 5) == 0:
                logger.info(f"  Episode {episode + 1}/{n_episodes} - Reward: {episode_reward:.3f}")
        
        # Aggregate results
        episode_df = pd.DataFrame(episode_data)
        step_df = pd.DataFrame(step_data)
        
        return {
            "episode_data": episode_df,
            "step_data": step_df,
            "summary_stats": self._calculate_summary_stats(episode_df),
            "performance_metrics": self._calculate_performance_metrics(episode_df, step_df)
        }
    
    def _calculate_summary_stats(self, episode_df: pd.DataFrame) -> Dict:
        """Calculate summary statistics for episodes"""
        return {
            "mean_reward": episode_df["total_reward"].mean(),
            "std_reward": episode_df["total_reward"].std(),
            "min_reward": episode_df["total_reward"].min(),
            "max_reward": episode_df["total_reward"].max(),
            "mean_episode_length": episode_df["episode_length"].mean(),
            "total_passengers_served": episode_df["passengers_served"].sum(),
            "mean_passenger_satisfaction": episode_df["mean_passenger_satisfaction"].mean(),
            "mean_energy_efficiency": episode_df["mean_energy_efficiency"].mean(),
            "mean_schedule_adherence": episode_df["mean_schedule_adherence"].mean()
        }
    
    def _calculate_performance_metrics(self, episode_df: pd.DataFrame, step_df: pd.DataFrame) -> Dict:
        """Calculate detailed performance metrics"""
        return {
            "reward_stability": episode_df["total_reward"].std() / abs(episode_df["total_reward"].mean()) if episode_df["total_reward"].mean() != 0 else float('inf'),
            "convergence_episodes": self._calculate_convergence(episode_df["total_reward"]),
            "peak_performance_episode": episode_df["total_reward"].idxmax(),
            "service_consistency": step_df["active_trains"].std(),
            "passenger_service_rate": episode_df["passengers_served"].sum() / episode_df["episode_length"].sum(),
            "energy_stability": episode_df["mean_energy_efficiency"].std()
        }
    
    def _calculate_convergence(self, rewards: pd.Series, window: int = 10) -> int:
        """Estimate convergence point based on reward stability"""
        if len(rewards) < window * 2:
            return len(rewards)
        
        rolling_mean = rewards.rolling(window=window).mean()
        rolling_std = rewards.rolling(window=window).std()
        
        # Find where standard deviation stabilizes (convergence)
        stability_threshold = rolling_std.mean() * 0.5
        stable_points = rolling_std < stability_threshold
        
        if stable_points.any():
            return stable_points.idxmax()
        else:
            return len(rewards)
    
    def generate_visualizations(self, save_dir: str = "test_results/"):
        """Generate comprehensive visualizations of test results"""
        
        os.makedirs(save_dir, exist_ok=True)
        logger.info(f"Generating visualizations in {save_dir}")
        
        # 1. Scenario Comparison - Reward Performance
        self._plot_scenario_rewards(save_dir)
        
        # 2. Learning Curves and Convergence
        self._plot_learning_curves(save_dir)
        
        # 3. Performance Metrics Comparison
        self._plot_performance_metrics(save_dir)
        
        # 4. Operational Efficiency Analysis
        self._plot_operational_efficiency(save_dir)
        
        # 5. Passenger Service Analysis
        self._plot_passenger_service(save_dir)
        
        logger.info("Visualizations generated successfully")
    
    def _plot_scenario_rewards(self, save_dir: str):
        """Plot reward performance across scenarios"""
        plt.figure(figsize=(15, 10))
        
        # Prepare data
        all_rewards = []
        scenarios = []
        
        for scenario, results in self.results.items():
            rewards = results["episode_data"]["total_reward"].tolist()
            all_rewards.extend(rewards)
            scenarios.extend([scenario] * len(rewards))
        
        df = pd.DataFrame({"Scenario": scenarios, "Reward": all_rewards})
        
        # Create subplots
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
        
        # Box plot
        sns.boxplot(data=df, x="Scenario", y="Reward", ax=ax1)
        ax1.set_title("Reward Distribution by Scenario")
        ax1.tick_params(axis='x', rotation=45)
        
        # Violin plot
        sns.violinplot(data=df, x="Scenario", y="Reward", ax=ax2)
        ax2.set_title("Reward Distribution Density")
        ax2.tick_params(axis='x', rotation=45)
        
        # Episode progression for each scenario
        for scenario, results in self.results.items():
            episode_data = results["episode_data"]
            ax3.plot(episode_data["episode"], episode_data["total_reward"], 
                    label=scenario, marker='o', markersize=3, alpha=0.7)
        ax3.set_title("Reward Progression by Episode")
        ax3.set_xlabel("Episode")
        ax3.set_ylabel("Total Reward")
        ax3.legend()
        ax3.grid(True, alpha=0.3)
        
        # Summary statistics table
        summary_data = []
        for scenario, results in self.results.items():
            stats = results["summary_stats"]
            summary_data.append([
                scenario,
                f"{stats['mean_reward']:.3f}",
                f"{stats['std_reward']:.3f}",
                f"{stats['mean_passenger_satisfaction']:.3f}",
                f"{stats['mean_energy_efficiency']:.3f}"
            ])
        
        table = ax4.table(cellText=summary_data,
                         colLabels=["Scenario", "Mean Reward", "Std Reward", 
                                   "Passenger Sat.", "Energy Eff."],
                         cellLoc='center',
                         loc='center')
        table.auto_set_font_size(False)
        table.set_fontsize(9)
        table.scale(1.2, 1.5)
        ax4.axis('off')
        ax4.set_title("Performance Summary")
        
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, "scenario_rewards.png"), dpi=300, bbox_inches='tight')
        plt.close()
    
    def _plot_learning_curves(self, save_dir: str):
        """Plot learning curves and convergence analysis"""
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        for i, (scenario, results) in enumerate(self.results.items()):
            ax = axes[i//2, i%2]
            episode_data = results["episode_data"]
            
            # Plot raw rewards
            ax.plot(episode_data["episode"], episode_data["total_reward"], 
                   alpha=0.3, color='blue', label='Episode Reward')
            
            # Plot rolling average
            window = max(3, len(episode_data) // 10)
            rolling_mean = episode_data["total_reward"].rolling(window=window).mean()
            ax.plot(episode_data["episode"], rolling_mean, 
                   color='red', linewidth=2, label=f'Rolling Avg ({window})')
            
            ax.set_title(f"Learning Curve - {scenario}")
            ax.set_xlabel("Episode")
            ax.set_ylabel("Total Reward")
            ax.legend()
            ax.grid(True, alpha=0.3)
        
        # Remove empty subplot if we have fewer than 4 scenarios
        if len(self.results) < 4:
            for i in range(len(self.results), 4):
                axes[i//2, i%2].remove()
        
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, "learning_curves.png"), dpi=300, bbox_inches='tight')
        plt.close()
    
    def _plot_performance_metrics(self, save_dir: str):
        """Plot comprehensive performance metrics comparison"""
        # Prepare data
        metrics_data = []
        for scenario, results in self.results.items():
            stats = results["summary_stats"]
            metrics_data.append({
                "Scenario": scenario,
                "Passenger Satisfaction": stats["mean_passenger_satisfaction"],
                "Energy Efficiency": stats["mean_energy_efficiency"], 
                "Schedule Adherence": stats["mean_schedule_adherence"],
                "Service Rate": results["performance_metrics"]["passenger_service_rate"]
            })
        
        metrics_df = pd.DataFrame(metrics_data)
        
        # Create radar chart
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
        
        # Heatmap of metrics
        metrics_for_heatmap = metrics_df.set_index("Scenario")
        sns.heatmap(metrics_for_heatmap.T, annot=True, cmap="YlOrRd", ax=ax1, 
                   fmt='.3f', cbar_kws={'label': 'Performance Score'})
        ax1.set_title("Performance Metrics Heatmap")
        
        # Bar chart comparison
        metrics_melted = metrics_df.melt(id_vars=["Scenario"], var_name="Metric", value_name="Score")
        sns.barplot(data=metrics_melted, x="Metric", y="Score", hue="Scenario", ax=ax2)
        ax2.set_title("Performance Metrics Comparison")
        ax2.tick_params(axis='x', rotation=45)
        ax2.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, "performance_metrics.png"), dpi=300, bbox_inches='tight')
        plt.close()
    
    def _plot_operational_efficiency(self, save_dir: str):
        """Plot operational efficiency metrics"""
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
        
        for scenario, results in self.results.items():
            step_data = results["step_data"]
            
            # Active trains over time
            ax1.plot(step_data.groupby("step")["active_trains"].mean(), 
                    label=scenario, alpha=0.7)
            
            # Average energy levels
            ax2.plot(step_data.groupby("step")["average_energy"].mean(), 
                    label=scenario, alpha=0.7)
            
            # Passengers waiting
            ax3.plot(step_data.groupby("step")["total_passengers_waiting"].mean(), 
                    label=scenario, alpha=0.7)
            
        ax1.set_title("Active Trains Over Time")
        ax1.set_xlabel("Time Step")
        ax1.set_ylabel("Number of Active Trains")
        ax1.legend()
        ax1.grid(True, alpha=0.3)
        
        ax2.set_title("Average Energy Levels")
        ax2.set_xlabel("Time Step") 
        ax2.set_ylabel("Energy Level (%)")
        ax2.legend()
        ax2.grid(True, alpha=0.3)
        
        ax3.set_title("Passengers Waiting")
        ax3.set_xlabel("Time Step")
        ax3.set_ylabel("Number of Waiting Passengers")
        ax3.legend()
        ax3.grid(True, alpha=0.3)
        
        # Efficiency summary
        efficiency_data = []
        for scenario, results in self.results.items():
            perf_metrics = results["performance_metrics"]
            efficiency_data.append([
                scenario,
                f"{perf_metrics.get('service_consistency', 0):.3f}",
                f"{perf_metrics.get('energy_stability', 0):.3f}",
                f"{perf_metrics.get('passenger_service_rate', 0):.3f}"
            ])
        
        table = ax4.table(cellText=efficiency_data,
                         colLabels=["Scenario", "Service Consistency", 
                                   "Energy Stability", "Service Rate"],
                         cellLoc='center',
                         loc='center')
        table.auto_set_font_size(False)
        table.set_fontsize(9)
        table.scale(1.2, 1.5)
        ax4.axis('off')
        ax4.set_title("Operational Efficiency Summary")
        
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, "operational_efficiency.png"), dpi=300, bbox_inches='tight')
        plt.close()
    
    def _plot_passenger_service(self, save_dir: str):
        """Plot passenger service analysis"""
        plt.figure(figsize=(12, 8))
        
        # Passenger service metrics
        service_data = []
        for scenario, results in self.results.items():
            episode_data = results["episode_data"]
            service_data.extend([{
                "Scenario": scenario,
                "Episode": row["episode"],
                "Passengers Served": row["passengers_served"],
                "Passenger Satisfaction": row["mean_passenger_satisfaction"]
            } for _, row in episode_data.iterrows()])
        
        service_df = pd.DataFrame(service_data)
        
        # Create subplots
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
        
        # Passengers served by scenario
        sns.boxplot(data=service_df, x="Scenario", y="Passengers Served", ax=ax1)
        ax1.set_title("Passengers Served Distribution")
        ax1.tick_params(axis='x', rotation=45)
        
        # Satisfaction vs passengers served
        sns.scatterplot(data=service_df, x="Passengers Served", y="Passenger Satisfaction", 
                       hue="Scenario", alpha=0.6, ax=ax2)
        ax2.set_title("Satisfaction vs Service Volume")
        
        # Service progression over episodes
        for scenario in service_df["Scenario"].unique():
            scenario_data = service_df[service_df["Scenario"] == scenario]
            ax3.plot(scenario_data["Episode"], scenario_data["Passengers Served"], 
                    label=scenario, alpha=0.7, marker='o', markersize=3)
        ax3.set_title("Service Volume Over Episodes")
        ax3.set_xlabel("Episode")
        ax3.set_ylabel("Passengers Served")
        ax3.legend()
        ax3.grid(True, alpha=0.3)
        
        # Average satisfaction by scenario
        satisfaction_avg = service_df.groupby("Scenario")["Passenger Satisfaction"].mean()
        satisfaction_avg.plot(kind='bar', ax=ax4, color='skyblue')
        ax4.set_title("Average Passenger Satisfaction")
        ax4.set_ylabel("Satisfaction Score")
        ax4.tick_params(axis='x', rotation=45)
        
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, "passenger_service.png"), dpi=300, bbox_inches='tight')
        plt.close()
    
    def export_results(self, save_dir: str = "test_results/"):
        """Export detailed results to files"""
        os.makedirs(save_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Export summary statistics
        summary_file = os.path.join(save_dir, f"test_summary_{timestamp}.json")
        summary_data = {
            "model_path": self.model_path,
            "test_timestamp": timestamp,
            "scenarios_tested": self.scenarios,
            "results": {scenario: results["summary_stats"] 
                       for scenario, results in self.results.items()}
        }
        
        with open(summary_file, 'w') as f:
            json.dump(summary_data, f, indent=2)
        
        # Export detailed episode data
        for scenario, results in self.results.items():
            episode_file = os.path.join(save_dir, f"episodes_{scenario}_{timestamp}.csv")
            results["episode_data"].to_csv(episode_file, index=False)
            
            step_file = os.path.join(save_dir, f"steps_{scenario}_{timestamp}.csv") 
            results["step_data"].to_csv(step_file, index=False)
        
        logger.info(f"Results exported to {save_dir}")
        return save_dir
    
    def run_live_demonstration(self, scenario: str = "standard", episodes: int = 3):
        """Run live demonstration with environment rendering"""
        logger.info(f"Running live demonstration - Scenario: {scenario}")
        
        # Create environment with human rendering
        env_config = create_environment_config(scenario)
        env = KMRLMetroEnvironment(**env_config, render_mode="human")
        
        for episode in range(episodes):
            print(f"\n{'='*60}")
            print(f"LIVE DEMONSTRATION - Episode {episode + 1}/{episodes}")
            print(f"Scenario: {scenario}")
            print(f"{'='*60}")
            
            obs, info = env.reset()
            episode_reward = 0
            step = 0
            done = False
            
            while not done and step < 100:  # Limit steps for demo
                # Get action from trained agent
                action, _ = self.model.predict(obs, deterministic=True)
                obs, reward, terminated, truncated, info = env.step(action)
                
                episode_reward += reward
                step += 1
                done = terminated or truncated
                
                # Render current state
                env.render()
                
                # Brief pause for readability
                import time
                time.sleep(0.5)
                
                if step % 20 == 0:
                    print(f"\nStep {step}: Cumulative Reward = {episode_reward:.3f}")
                    input("Press Enter to continue...")
            
            print(f"\nEpisode {episode + 1} completed!")
            print(f"Total Reward: {episode_reward:.3f}")
            print(f"Total Steps: {step}")
            
            if episode < episodes - 1:
                input("\nPress Enter to start next episode...")
        
        env.close()
        logger.info("Live demonstration completed")


def main():
    """Main testing function"""
    parser = argparse.ArgumentParser(description="Test KMRL Metro RL Agent")
    parser.add_argument("model_path", type=str, help="Path to trained model")
    parser.add_argument("--scenarios", nargs='+', 
                       default=["standard", "rush_hour", "accessibility_focus"],
                       help="Scenarios to test")
    parser.add_argument("--episodes", type=int, default=20,
                       help="Episodes per scenario")
    parser.add_argument("--output_dir", type=str, default="test_results/",
                       help="Output directory for results")
    parser.add_argument("--live_demo", action="store_true",
                       help="Run live demonstration")
    parser.add_argument("--demo_episodes", type=int, default=3,
                       help="Episodes for live demo")
    parser.add_argument("--no_plots", action="store_true",
                       help="Skip generating plots")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.model_path):
        logger.error(f"Model not found: {args.model_path}")
        return
    
    logger.info("="*60)
    logger.info("KMRL Metro RL Agent Testing")
    logger.info("="*60)
    logger.info(f"Model: {args.model_path}")
    logger.info(f"Scenarios: {args.scenarios}")
    logger.info(f"Episodes per scenario: {args.episodes}")
    
    try:
        # Initialize tester
        tester = AgentTester(args.model_path, args.scenarios)
        
        if args.live_demo:
            # Run live demonstration
            demo_scenario = args.scenarios[0] if args.scenarios else "standard"
            tester.run_live_demonstration(demo_scenario, args.demo_episodes)
        else:
            # Run comprehensive testing
            results = tester.run_scenario_tests(args.episodes)
            
            # Generate visualizations
            if not args.no_plots:
                tester.generate_visualizations(args.output_dir)
            
            # Export results
            output_path = tester.export_results(args.output_dir)
            
            # Print summary
            print("\n" + "="*60)
            print("TESTING SUMMARY")
            print("="*60)
            
            for scenario, scenario_results in results.items():
                stats = scenario_results["summary_stats"]
                print(f"\n{scenario.upper()}:")
                print(f"  Mean Reward: {stats['mean_reward']:.4f} ± {stats['std_reward']:.4f}")
                print(f"  Passenger Satisfaction: {stats['mean_passenger_satisfaction']:.4f}")
                print(f"  Energy Efficiency: {stats['mean_energy_efficiency']:.4f}")
                print(f"  Schedule Adherence: {stats['mean_schedule_adherence']:.4f}")
                print(f"  Total Passengers Served: {stats['total_passengers_served']:,}")
            
            print(f"\nDetailed results saved to: {output_path}")
            print("="*60)
        
    except KeyboardInterrupt:
        logger.info("Testing interrupted by user")
    except Exception as e:
        logger.error(f"Testing failed: {str(e)}")
        raise


if __name__ == "__main__":
    main()