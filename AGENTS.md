<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use TanStack file routes with a shared GoUp shell; each content page owns its metadata so direct navigation and sharing work independently.
- Keep REST requests in src/lib/api.ts and shared API types in src/lib/models.ts; browser-side requests use the external service without adding an app backend.
- Keep auth and favorite state in one provider and fetch lists through TanStack Query; this keeps account state and mutations consistent between pages.
- Keep visual roles in src/styles.css and use the shared Button; palette changes must not require page-code changes.
