import * as am from "./auth.js";
import { createToken, createRefreshtoken } from "./jwtUtils.js";

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) throw new Error("Need email and password");
    const user = await am.login(email, password);

    const accessToken = createToken(user.user_id, user.role);
    const refreshToken = createRefreshtoken(user.user_id);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 86400000,
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error(`Error: ${error}`)
    return res.status(401).json({ message: `Some error: ${error}` });
  }
};

const logout = (req, res) => {
    res.clearCookie('accessToken', {httpOnly: true, secure: false, path: '/'})
    res.clearCookie("refreshToken", { httpOnly: true, secure: false, path: '/' });
    res.status(200).json({ message: 'Successfully logged out.' })
}

export { login, logout };
