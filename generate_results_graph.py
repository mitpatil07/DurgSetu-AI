import matplotlib.pyplot as plt
import numpy as np
import os

# Data
runs = ['Run 1', 'Run 2', 'Run 3', 'Average']
accuracy = [0.7750, 0.6000, 0.6500, 0.6750]
precision = [0.6897, 0.5667, 0.6000, 0.6188]
recall = [1.0000, 0.8500, 0.9000, 0.9167]
f1_score = [0.8163, 0.6800, 0.7200, 0.7388]

# Set up the figure
plt.figure(figsize=(10, 6))

# Plot lines and scatter points for each metric
plt.plot(runs, accuracy, marker='o', label='Accuracy', linewidth=2, markersize=8)
plt.plot(runs, precision, marker='s', label='Precision', linewidth=2, markersize=8)
plt.plot(runs, recall, marker='^', label='Recall', linewidth=2, markersize=8)
plt.plot(runs, f1_score, marker='D', label='F1-Score', linewidth=2, markersize=8)

# Add title and labels
plt.title('DurgSetu AI Evaluation Metrics Across Runs', fontsize=16, fontweight='bold', pad=20)
plt.xlabel('Evaluation Runs', fontsize=12)
plt.ylabel('Score (0.0 to 1.0)', fontsize=12)
plt.ylim(0, 1.1)
plt.grid(True, linestyle='--', alpha=0.7)
plt.legend(loc='lower left', fontsize=10)

# Add data labels
for x, vals in zip([runs]*4, [accuracy, precision, recall, f1_score]):
    for i, _ in enumerate(vals):
        plt.annotate(f"{vals[i]:.3f}", (x[i], vals[i]), textcoords="offset points", xytext=(0,10), ha='center', fontsize=9)

# Save the plot
metrics_plot_path = os.path.join(os.path.dirname(__file__), 'performance_metrics_graph.png')
plt.tight_layout()
plt.savefig(metrics_plot_path, dpi=300, bbox_inches='tight')
print(f"Metrics graph saved successfully to: {metrics_plot_path}")
plt.close()

# Generate second plot for Confusion Matrix elements (TP, TN, FP, FN)
plt.figure(figsize=(10, 6))

tp = [20, 17, 18, 18.33]
tn = [11, 7, 8, 8.67]
fp = [9, 13, 12, 11.33]
fn = [0, 3, 2, 1.67]

# Define bar width and positions
bar_width = 0.2
index = np.arange(len(runs))

plt.bar(index, tp, bar_width, label='True Positives (TP)', color='green', alpha=0.7)
plt.bar(index + bar_width, tn, bar_width, label='True Negatives (TN)', color='blue', alpha=0.7)
plt.bar(index + 2*bar_width, fp, bar_width, label='False Positives (FP)', color='orange', alpha=0.7)
plt.bar(index + 3*bar_width, fn, bar_width, label='False Negatives (FN)', color='red', alpha=0.7)

plt.xlabel('Evaluation Runs', fontsize=12)
plt.ylabel('Count', fontsize=12)
plt.title('DurgSetu AI Confusion Matrix Metrics', fontsize=16, fontweight='bold', pad=20)
plt.xticks(index + bar_width * 1.5, runs)
plt.legend(loc='upper right', fontsize=10)
plt.grid(True, axis='y', linestyle='--', alpha=0.7)

confusion_plot_path = os.path.join(os.path.dirname(__file__), 'confusion_matrix_graph.png')
plt.tight_layout()
plt.savefig(confusion_plot_path, dpi=300, bbox_inches='tight')
print(f"Confusion matrix graph saved successfully to: {confusion_plot_path}")
plt.close()
