# Agent Notes

- Always run the dev server in the background using `tmux` so you can keep working while it runs.
- Use a repo-local socket dir to avoid tmp permission issues: `TMUX_TMPDIR=$(pwd)/.tmux`.
- Start: `TMUX_TMPDIR=$(pwd)/.tmux tmux new -s server 'npm run dev'`.
- Detach: `Ctrl+B` `D`. Reattach: `TMUX_TMPDIR=$(pwd)/.tmux tmux attach -t server`.
