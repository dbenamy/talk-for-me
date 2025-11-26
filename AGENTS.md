## Dev server

- Run the dev server in tmux so it can keep running while you work.
- Use a repo-local tmux socket dir to avoid tmp permission issues: `TMUX_TMPDIR=$(pwd)/.tmux`.
- Always run tmux commands (start/list/attach/kill) with escalated permissions up front so the repo-local socket is accessible without a failed attempt.
- Start: `TMUX_TMPDIR=$(pwd)/.tmux tmux new -s server 'npm run dev'`.
- Detach: `Ctrl+B`, then `D`.
- Reattach: `TMUX_TMPDIR=$(pwd)/.tmux tmux attach -t server`.
