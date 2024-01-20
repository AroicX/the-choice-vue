export default function ({ $axios, redirect }) {
  $axios.onRequest((config) => {
    const token = JSON.parse(window.localStorage.getItem("token"));

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    console.log("Making request to " + config.url);
  });

  $axios.onError((error) => {
    const code = parseInt(error.response && error.response.status);
    if (code === 401) {
      localStorage.clear();
      return redirect("/auth/login");
    }
  });
}
