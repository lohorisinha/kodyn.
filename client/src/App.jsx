import {useEffect, useState} from "react";
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("http://localhost:3000/auth/me", {credentials: "include"})
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);
  if (loading) return <p>loading...</p>;
  return (
    <div>
      {user ? (
        <div>
          <h1>hey, {user.username}</h1>
          <img src={user.photos?.[0]?.value} alt="avatar" width={80} />
          <br />
          <a href="http://localhost:3000/auth/logout">logout</a>
        </div>
      ) : (
        <a href="http://localhost:3000/auth/github">login with github</a>
      )}
    </div>
  );
}
export default App;