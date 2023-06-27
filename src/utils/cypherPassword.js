import bcrypt from "bcryptjs";

export default async function cypherPassword(password) {
  const salt = await bcrypt.genSalt(10);

  return await bcrypt.hash(password, salt);
}
