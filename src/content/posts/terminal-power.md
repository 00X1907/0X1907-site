---
id: terminal-power
title: Terminal Power User Guide
category: Productivity
date: February 2, 2026
tags: Terminal, Bash, Zsh, Productivity, DevOps
---

The terminal is the ultimate power tool. While others click through GUIs, you'll be automating tasks, processing data, and managing systems at the speed of thought.

![Terminal setup](https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=900&h=400&fit=crop)

## Essential Navigation

Stop using arrow keys to navigate. Learn these shortcuts and never look back.

| Shortcut | Action |
| --- | --- |
| Ctrl + A | Jump to start of line |
| Ctrl + E | Jump to end of line |
| Ctrl + W | Delete word backward |
| Alt + D | Delete word forward |
| Ctrl + U | Clear line before cursor |
| Ctrl + K | Clear line after cursor |
| Ctrl + R | Search command history |
| Ctrl + L | Clear screen |
| !! | Repeat last command |
| !$ | Last argument of previous command |

:::tip Pro Tip
Enable `vi` mode in your shell for even faster editing: `set -o vi` in bash or `bindkey -v` in zsh. Press Escape to enter command mode, then use vim motions.
:::

```bash
# filename: .zshrc
# Enable vi mode with hybrid keybindings
bindkey -v
bindkey '^A' beginning-of-line
bindkey '^E' end-of-line
bindkey '^R' history-incremental-search-backward

# Reduce vi mode switch delay
export KEYTIMEOUT=1
```

---

## Directory Navigation Superpowers

Typing `cd` all day is inefficient. Level up your navigation.

```bash
# filename: terminal
# Pushd/Popd - Directory stack
pushd /var/log     # Push current dir, cd to /var/log
pushd /etc         # Push /var/log, cd to /etc
popd               # Pop, return to /var/log
popd               # Pop, return to original dir
dirs -v            # View directory stack

# Dash to previous directory
cd /home/user/projects
cd /var/log
cd -               # Back to /home/user/projects

# Double dots on steroids
alias ...='cd ../..'
alias ....='cd ../../..'
alias .....='cd ../../../..'
```

:::note Z and Autojump
Install `z` or `autojump` to jump to frequently-used directories with fuzzy matching. After visiting `/home/user/projects/webapp` a few times, just type `z webapp` to jump there from anywhere.
:::

### Install Z (Recommended)

```bash
# filename: terminal
# Install z
git clone https://github.com/rupa/z.git ~/.z
echo '. ~/.z/z.sh' >> ~/.zshrc
source ~/.zshrc

# Usage after visiting directories
z proj          # Jump to /home/user/projects
z web           # Jump to most frecent match for "web"
z -l web        # List all matches
```

---

## Text Processing Pipeline

Unix philosophy: small tools that do one thing well, connected by pipes.

```bash
# filename: terminal
# Count lines in all TypeScript files
find . -name "*.ts" | xargs wc -l | tail -1

# Find largest files
du -ah . | sort -rh | head -20

# Extract unique error types from logs
cat server.log | grep ERROR | awk '{print $4}' | sort | uniq -c | sort -rn

# Replace text across multiple files
find . -name "*.js" -exec sed -i 's/oldFunc/newFunc/g' {} +

# Monitor log file in real time with filtering
tail -f app.log | grep --line-buffered "ERROR\|WARN"
```

### Essential Unix Tools

| Tool | Purpose | Example |
| --- | --- | --- |
| grep | Search text patterns | `grep -r "TODO" .` |
| sed | Stream editor | `sed 's/old/new/g' file` |
| awk | Text processing | `awk '{print $1}' file` |
| sort | Sort lines | `sort -k2 -n file` |
| uniq | Filter duplicates | `sort file \| uniq -c` |
| cut | Extract columns | `cut -d',' -f2 data.csv` |
| tr | Translate characters | `tr '[:lower:]' '[:upper:]'` |
| xargs | Build commands | `find . \| xargs rm` |
| jq | JSON processor | `cat data.json \| jq '.users[]'` |

:::warning Pipe Gotcha
Pipes create subshells. Variables set in a pipe don't persist. Use process substitution instead: `while read line; do ...; done < <(command)`
:::

---

## History Mastery

Your command history is a goldmine. Learn to search it efficiently.

```bash
# filename: .zshrc
# Infinite history
HISTSIZE=1000000
SAVEHIST=1000000
HISTFILE=~/.zsh_history

# Better history behavior
setopt EXTENDED_HISTORY       # Record timestamp
setopt HIST_EXPIRE_DUPS_FIRST # Expire duplicates first
setopt HIST_IGNORE_DUPS       # Don't record duplicates
setopt HIST_IGNORE_SPACE      # Ignore commands starting with space
setopt HIST_VERIFY            # Don't execute immediately on history expansion
setopt SHARE_HISTORY          # Share history between sessions
```

### History Shortcuts

```bash
# filename: terminal
# Search history
Ctrl+R                    # Interactive search (keep pressing for more matches)
history | grep docker     # Search for docker commands

# History expansion
!!                        # Last command
!$                        # Last argument
!^                        # First argument
!*                        # All arguments
!docker                   # Last command starting with "docker"
!?container               # Last command containing "container"
^old^new                  # Replace in last command

# Practical examples
sudo !!                   # Re-run last command with sudo
vim !$                    # Edit the file from last command
git add !*                # Add all files from last command
```

![Command history visualization](https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop)

---

## FZF: The Fuzzy Finder

FZF transforms how you interact with the terminal. Install it immediately.

```bash
# filename: terminal
# Install fzf
git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf
~/.fzf/install

# Or with Homebrew
brew install fzf
$(brew --prefix)/opt/fzf/install
```

```bash
# filename: .zshrc
# FZF configuration
export FZF_DEFAULT_COMMAND='fd --type f --hidden --follow --exclude .git'
export FZF_DEFAULT_OPTS='--height 40% --layout=reverse --border'
export FZF_CTRL_T_COMMAND="$FZF_DEFAULT_COMMAND"

# Preview files with bat
export FZF_CTRL_T_OPTS="--preview 'bat --color=always --line-range :50 {}'"

# Better history search
export FZF_CTRL_R_OPTS="--preview 'echo {}' --preview-window down:3:wrap"

# Custom functions
# fe - fuzzy edit
fe() {
  local file
  file=$(fzf --query="$1" --select-1 --exit-0)
  [ -n "$file" ] && ${EDITOR:-vim} "$file"
}

# fkill - fuzzy kill process
fkill() {
  local pid
  pid=$(ps -ef | sed 1d | fzf -m | awk '{print $2}')
  if [ "x$pid" != "x" ]; then
    echo $pid | xargs kill -${1:-9}
  fi
}

# fbr - fuzzy git branch
fbr() {
  local branches branch
  branches=$(git branch -a) &&
  branch=$(echo "$branches" | fzf +s +m) &&
  git checkout $(echo "$branch" | sed "s:.* remotes/origin/::" | sed "s:.* ::")
}
```

:::question Challenge
How would you create an fzf function to fuzzy-search and connect to SSH hosts from your `~/.ssh/config`?
:::

---

## Aliases and Functions

Automate your most common tasks.

```bash
# filename: .zshrc
# Git aliases (save hours per week)
alias g='git'
alias gs='git status'
alias gd='git diff'
alias gds='git diff --staged'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
alias gl='git log --oneline -20'
alias gco='git checkout'
alias gb='git branch'
alias gf='git fetch --all --prune'

# Modern replacements
alias ls='eza --icons'
alias ll='eza -la --icons --git'
alias tree='eza --tree --icons'
alias cat='bat'
alias find='fd'
alias grep='rg'
alias top='htop'
alias du='dust'
alias df='duf'

# Quick navigation
alias dev='cd ~/Developer'
alias dl='cd ~/Downloads'
alias desk='cd ~/Desktop'

# Utility functions
mkcd() { mkdir -p "$1" && cd "$1"; }
extract() {
  if [ -f "$1" ]; then
    case "$1" in
      *.tar.bz2) tar xjf "$1" ;;
      *.tar.gz)  tar xzf "$1" ;;
      *.tar.xz)  tar xJf "$1" ;;
      *.zip)     unzip "$1" ;;
      *.gz)      gunzip "$1" ;;
      *.rar)     unrar x "$1" ;;
      *.7z)      7z x "$1" ;;
      *)         echo "Unknown format: $1" ;;
    esac
  fi
}
```

### Modern CLI Replacements

| Classic | Modern | Improvement |
| --- | --- | --- |
| ls | eza | Icons, git status, better colors |
| cat | bat | Syntax highlighting, line numbers |
| find | fd | Faster, intuitive syntax |
| grep | ripgrep | Much faster, respects .gitignore |
| top | htop/btop | Interactive, visual |
| du | dust | Visual directory sizes |
| df | duf | Cleaner disk usage |
| man | tldr | Practical examples |

```bash
# filename: terminal
# Install modern tools with Homebrew
brew install eza bat fd ripgrep htop dust duf tldr fzf

# Or with cargo (Rust)
cargo install eza bat fd-find ripgrep
```

---

## Tmux: Terminal Multiplexer

One terminal to rule them all. Tmux lets you create persistent sessions with multiple windows and panes.

```bash
# filename: .tmux.conf
# Remap prefix to Ctrl+a (easier to reach)
unbind C-b
set -g prefix C-a
bind C-a send-prefix

# Split panes with | and -
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"

# Navigate panes with vim keys
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R

# Resize panes
bind -r H resize-pane -L 5
bind -r J resize-pane -D 5
bind -r K resize-pane -U 5
bind -r L resize-pane -R 5

# Enable mouse
set -g mouse on

# Start windows at 1, not 0
set -g base-index 1
setw -g pane-base-index 1

# Better colors
set -g default-terminal "screen-256color"
set -ga terminal-overrides ",xterm-256color:Tc"

# Status bar
set -g status-style bg=black,fg=white
set -g status-left '#[fg=green]#S '
set -g status-right '#[fg=yellow]%H:%M'
```

### Essential Tmux Commands

| Command | Action |
| --- | --- |
| tmux new -s name | Create named session |
| tmux attach -t name | Attach to session |
| tmux ls | List sessions |
| Prefix + c | New window |
| Prefix + n/p | Next/previous window |
| Prefix + 1-9 | Go to window N |
| Prefix + d | Detach from session |
| Prefix + % | Split horizontally |
| Prefix + " | Split vertically |
| Prefix + arrow | Navigate panes |
| Prefix + z | Zoom pane (toggle) |

:::tip Session Persistence
Tmux sessions survive terminal closure. Start a long-running process, detach (Prefix+d), close your terminal, come back later, and reattach. Your process is still running!
:::

---

## Shell Scripting Essentials

Write scripts that are robust and maintainable.

```bash
# filename: script-template.sh
#!/usr/bin/env bash
#
# Description: Template for robust bash scripts
# Usage: ./script.sh [options] <arguments>
#

set -euo pipefail  # Exit on error, undefined vars, pipe failures
IFS=$'\n\t'        # Safer word splitting

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No color

# Logging functions
log_info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $*" >&2; }
log_error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# Usage function
usage() {
  cat << EOF
Usage: $(basename "$0") [options] <directory>

Options:
  -h, --help     Show this help message
  -v, --verbose  Enable verbose output
  -n, --dry-run  Show what would be done

Examples:
  $(basename "$0") /path/to/dir
  $(basename "$0") -v --dry-run /tmp

EOF
  exit "${1:-0}"
}

# Parse arguments
VERBOSE=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)    usage 0 ;;
    -v|--verbose) VERBOSE=true; shift ;;
    -n|--dry-run) DRY_RUN=true; shift ;;
    -*)           log_error "Unknown option: $1"; usage 1 ;;
    *)            break ;;
  esac
done

# Require directory argument
if [[ $# -lt 1 ]]; then
  log_error "Missing required argument: directory"
  usage 1
fi

TARGET_DIR="$1"

# Validate directory exists
if [[ ! -d "$TARGET_DIR" ]]; then
  log_error "Directory not found: $TARGET_DIR"
  exit 1
fi

# Main logic
main() {
  log_info "Processing: $TARGET_DIR"
  
  if $DRY_RUN; then
    log_warn "Dry run mode - no changes will be made"
  fi
  
  # Your script logic here
  
  log_info "Done!"
}

main "$@"
```

---

## Quick Reference Card

```text
# Navigation
Ctrl+A/E       Start/End of line
Ctrl+W         Delete word back
Ctrl+U/K       Clear before/after cursor
Ctrl+R         Search history
Ctrl+L         Clear screen

# Files
ll             List detailed
..             Parent dir
z <name>       Jump to frecent dir
Ctrl+T         FZF file finder
fe <query>     Fuzzy edit file

# Git
gs/gd/gl       Status/Diff/Log
ga/gc/gp       Add/Commit/Push
fbr            FZF branch switch

# Tmux
Ctrl+a c       New window
Ctrl+a |/-     Split h/v
Ctrl+a d       Detach
Ctrl+a z       Zoom toggle

# Process
Ctrl+Z         Suspend
fg/bg          Resume fore/background
jobs           List jobs
kill %1        Kill job 1
```

> "The command line is the original AI—a tool that extends your intentions into powerful actions across your entire system."

:::note Keep Learning
The terminal is deep. Pick one new trick each week, practice it until it's muscle memory, then add another. In a year, you'll be unstoppable.
:::

![Terminal mastery](https://images.unsplash.com/photo-1550439062-609e1531270e?w=800&h=300&fit=crop)
