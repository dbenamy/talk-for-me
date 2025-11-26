## Dev server

- Run the dev server in tmux so it can keep running while you work.
- Use a repo-local tmux socket dir to avoid tmp permission issues: `TMUX_TMPDIR=$(pwd)/.tmux`.
- Start: `TMUX_TMPDIR=$(pwd)/.tmux tmux new -s server 'npm run dev'`.
  - If you see `open terminal failed: not a terminal` (e.g., running from a non-interactive shell), start with a pseudo-tty instead: `TMUX_TMPDIR=$(pwd)/.tmux script -q /dev/null tmux new -d -s server 'npm run dev'`.
  - If you get a permission error creating/using the socket, rerun with escalated permissions.
- Detach: `Ctrl+B`, then `D`.
- Reattach: `TMUX_TMPDIR=$(pwd)/.tmux tmux attach -t server`.
