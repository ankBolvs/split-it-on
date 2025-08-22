const jwt = require("jsonwebtoken");
const fs = require("fs");

const APP_SECRET = "digitsplit"; // secret key
const mappings = {
  post: [],
  get: [],
  delete: [],
};

const data = require("./data")();
const users = data.users;
function requiresAuth(method, url) {
  return (
    (mappings[method.toLowerCase()] || []).find((p) => url.startsWith(p)) !==
    undefined
  );
}

function isUserPresent(name, password) {
  const user = users.find((u) => u.name === name && u.password === password);
  return user || null;
}

module.exports = function (req, res, next) {
  if (req.url.endsWith("/login") && req.method == "POST") {
    const user = isUserPresent(req.body.name, req.body.password);

    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    if (user.role != req.body.role) {
      return res.json({
        success: false,
        message: `Cannot login as ${req.body.role}`,
      });
    }

    const token = jwt.sign({ name: user.name, role: user.role }, APP_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(
      { name: user.name, role: user.role },
      APP_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      refresh_token: refreshToken,
      role: user.role,
      id: user.id,
    });
  } else if (requiresAuth(req.method, req.url)) {
    let token = req.headers["authorization"] || "";
    if (token.startsWith("Bearer<")) {
      token = token.substring(7, token.length - 1);
      try {
        jwt.verify(token, APP_SECRET);
        next();
        return;
      } catch (err) {}
    }
    res.statusCode = 401;
    res.end();
    return;
  }
  next();
};
