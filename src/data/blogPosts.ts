export interface ContentBlock {
  type: "paragraph" | "heading" | "code" | "list" | "ordered-list" | "blockquote" | "divider" | "inline-code";
  content?: string;
  level?: 1 | 2 | 3;
  language?: string;
  filename?: string;
  items?: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  date?: string;
  content: ContentBlock[];
}

export const blogPosts: BlogPost[] = [
  {
    id: "intro",
    title: "Introduction",
    category: "Guides",
    date: "January 15, 2025",
    content: [
      {
        type: "paragraph",
        content: "Research is a systematic inquiry to describe, explain, predict, and control the observed phenomenon. Research involves inductive and deductive methods."
      },
      {
        type: "paragraph",
        content: "This layout is optimized for long-form technical reading. You can add your LaTeX equations, code snippets, or diagrams here easily."
      },
      {
        type: "heading",
        level: 2,
        content: "Getting Started"
      },
      {
        type: "paragraph",
        content: "To get started with this research blog, you can modify the blog posts in the data file. Each post supports multiple content types including paragraphs, headings, code blocks, lists, and more."
      },
      {
        type: "code",
        language: "typescript",
        filename: "example.ts",
        content: `interface BlogPost {
  id: string;
  title: string;
  category: string;
  date?: string;
  content: ContentBlock[];
}

const myPost: BlogPost = {
  id: "my-first-post",
  title: "My Research",
  category: "Guides",
  content: [
    { type: "paragraph", content: "Hello world!" }
  ]
};`
      },
      {
        type: "heading",
        level: 2,
        content: "Features"
      },
      {
        type: "list",
        items: [
          "Syntax-highlighted code blocks with copy button",
          "Dark and light theme support",
          "Searchable sidebar navigation",
          "Clean, readable typography",
          "Responsive design"
        ]
      }
    ]
  },
  {
    id: "ml",
    title: "Machine Learning",
    category: "Guides",
    date: "January 20, 2025",
    content: [
      {
        type: "paragraph",
        content: "Machine learning is a branch of artificial intelligence (AI) and computer science which focuses on the use of data and algorithms to imitate the way that humans learn."
      },
      {
        type: "paragraph",
        content: "It is one of the most exciting fields in modern research today. Below we'll explore some fundamental concepts."
      },
      {
        type: "heading",
        level: 2,
        content: "Linear Regression"
      },
      {
        type: "paragraph",
        content: "Linear regression is one of the simplest machine learning algorithms. It models the relationship between a dependent variable and one or more independent variables."
      },
      {
        type: "code",
        language: "python",
        filename: "linear_regression.py",
        content: `import numpy as np
from sklearn.linear_model import LinearRegression

# Create sample data
X = np.array([[1], [2], [3], [4], [5]])
y = np.array([2, 4, 5, 4, 5])

# Train the model
model = LinearRegression()
model.fit(X, y)

# Make predictions
predictions = model.predict([[6], [7]])
print(f"Predictions: {predictions}")`
      },
      {
        type: "heading",
        level: 2,
        content: "Neural Networks"
      },
      {
        type: "paragraph",
        content: "Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes that process information using connectionist approaches."
      },
      {
        type: "code",
        language: "python",
        filename: "neural_network.py",
        content: `import torch
import torch.nn as nn

class SimpleNN(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super(SimpleNN, self).__init__()
        self.layer1 = nn.Linear(input_size, hidden_size)
        self.relu = nn.ReLU()
        self.layer2 = nn.Linear(hidden_size, output_size)
    
    def forward(self, x):
        x = self.layer1(x)
        x = self.relu(x)
        x = self.layer2(x)
        return x

# Create model
model = SimpleNN(10, 64, 2)`
      },
      {
        type: "blockquote",
        content: "\"The goal of machine learning is to develop algorithms that can automatically improve through experience.\" — Tom Mitchell"
      }
    ]
  },
  {
    id: "transformers",
    title: "Transformers",
    category: "Deep Learning",
    date: "January 25, 2025",
    content: [
      {
        type: "paragraph",
        content: "The Transformer architecture, introduced in the paper \"Attention Is All You Need\", has revolutionized natural language processing and beyond."
      },
      {
        type: "heading",
        level: 2,
        content: "Self-Attention Mechanism"
      },
      {
        type: "paragraph",
        content: "The key innovation of transformers is the self-attention mechanism, which allows the model to weigh the importance of different parts of the input when producing an output."
      },
      {
        type: "code",
        language: "python",
        filename: "attention.py",
        content: `import torch
import torch.nn.functional as F

def scaled_dot_product_attention(Q, K, V, mask=None):
    """
    Compute scaled dot-product attention.
    
    Args:
        Q: Query tensor (batch, heads, seq_len, d_k)
        K: Key tensor (batch, heads, seq_len, d_k)
        V: Value tensor (batch, heads, seq_len, d_v)
        mask: Optional attention mask
    
    Returns:
        Attention output and attention weights
    """
    d_k = Q.size(-1)
    
    # Compute attention scores
    scores = torch.matmul(Q, K.transpose(-2, -1)) / torch.sqrt(d_k)
    
    if mask is not None:
        scores = scores.masked_fill(mask == 0, float('-inf'))
    
    # Apply softmax
    attention_weights = F.softmax(scores, dim=-1)
    
    # Compute output
    output = torch.matmul(attention_weights, V)
    
    return output, attention_weights`
      },
      {
        type: "heading",
        level: 2,
        content: "Key Concepts"
      },
      {
        type: "ordered-list",
        items: [
          "Query (Q): What we're looking for",
          "Key (K): What information is available",
          "Value (V): The actual information to retrieve",
          "Attention Score: Dot product of Q and K",
          "Scaling: Divide by sqrt(d_k) for stability"
        ]
      }
    ]
  },
  {
    id: "rl-basics",
    title: "Reinforcement Learning",
    category: "Deep Learning",
    date: "February 1, 2025",
    content: [
      {
        type: "paragraph",
        content: "Reinforcement Learning (RL) is a type of machine learning where an agent learns to make decisions by interacting with an environment to maximize cumulative reward."
      },
      {
        type: "heading",
        level: 2,
        content: "Q-Learning"
      },
      {
        type: "paragraph",
        content: "Q-learning is a model-free reinforcement learning algorithm that learns the value of actions in states without requiring a model of the environment."
      },
      {
        type: "code",
        language: "python",
        filename: "q_learning.py",
        content: `import numpy as np

class QLearningAgent:
    def __init__(self, n_states, n_actions, lr=0.1, gamma=0.99, epsilon=0.1):
        self.q_table = np.zeros((n_states, n_actions))
        self.lr = lr
        self.gamma = gamma
        self.epsilon = epsilon
    
    def choose_action(self, state):
        if np.random.random() < self.epsilon:
            return np.random.randint(self.q_table.shape[1])
        return np.argmax(self.q_table[state])
    
    def update(self, state, action, reward, next_state):
        best_next = np.max(self.q_table[next_state])
        td_target = reward + self.gamma * best_next
        td_error = td_target - self.q_table[state, action]
        self.q_table[state, action] += self.lr * td_error`
      },
      {
        type: "heading",
        level: 2,
        content: "The Bellman Equation"
      },
      {
        type: "blockquote",
        content: "Q(s, a) = r + γ * max(Q(s', a'))"
      },
      {
        type: "paragraph",
        content: "The Bellman equation expresses the relationship between the value of a state-action pair and the values of subsequent state-action pairs."
      }
    ]
  }
];
