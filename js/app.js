const params = new URLSearchParams(window.location.search);
const app = params.get("app");

if (app && /^[a-z0-9_-]+$/i.test(app)) {
    window.location.replace(`apps/${encodeURIComponent(app)}/`);
} else {
    window.location.replace("index.html");
}