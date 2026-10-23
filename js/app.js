// const params = new Proxy(new URLSearchParams(window.location.href), {
//     get: (searchParams, prop) => searchParams.get(prop)
// });

const params = new URLSearchParams(window.location.search);

let app = params.get('app');

// alert(app);

// alert(urlParams.toString);

window.location.href = "apps\\" + app;