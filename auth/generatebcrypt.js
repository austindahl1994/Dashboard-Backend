import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
dotenv.config()

const password = "val&rom20";

bcrypt.genSalt(SALT_ROUNDS, function (err, SALT_ROUNDS) {
  bcrypt.hash(password, SALT_ROUNDS, function (err, hash) {
    if (err) throw err;
    console.log("Hashed Password:", hash);
  });
});