const BaseService = require("./base-service");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../lib/auth");

class UserService extends BaseService {
  async register(email, password, name, age) {
    const existingUser = await this.findBy("email", email);
    if (existingUser.length > 0) throw new Error("EMAIL_EXISTS");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.insert({
      email,
      password: hashedPassword,
      name,
      age,
      addresses: [],
      orders: [],
    });

    const token = generateToken({ id: user._id, role: "user" });

    return {
      token,
      id: user._id,
      email: user.email,
      name: user.name,
      age: user.age,
      addresses: user.addresses,
      orders: user.orders,
    };
  }

  async login(email, password) {
    const users = await this.findBy("email", email);
    if (!users[0]) throw new Error("USER_NOT_FOUND");

    const isMatch = await bcrypt.compare(password, users[0].password);
    if (!isMatch) throw new Error("INVALID_PASSWORD");

    const token = generateToken({ id: users[0]._id, role: "user" });

    return {
      token,
      id: users[0]._id,
      email: users[0].email,
      name: users[0].name,
      age: users[0].age,
      addresses: users[0].addresses,
      orders: users[0].orders,
    };
  }

  async updatePassword(userId, currentPassword, newPassword) {
    const user = await this.findOrFail(userId, "USER_NOT_FOUND");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new Error("INVALID_CURRENT_PASSWORD");

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return user;
  }

  async updateEmail(userId, newEmail) {
    const user = await this.findOrFail(userId, "USER_NOT_FOUND");

    const existingUser = await this.findBy("email", newEmail);
    if (existingUser.length > 0 && existingUser[0]._id.toString() !== userId) {
      throw new Error("EMAIL_EXISTS");
    }

    user.email = newEmail;
    await user.save();

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      age: user.age,
      addresses: user.addresses,
      orders: user.orders,
    };
  }

  async addAddress(userId, address) {
    const user = await this.findOrFail(userId, "USER_NOT_FOUND");
    user.addresses.push(address);
    await user.save();
    return user;
  }

  async updateAddress(userId, addressId, updateData) {
    const user = await this.findOrFail(userId, "USER_NOT_FOUND");

    const address = user.addresses.id(addressId);
    if (!address) throw new Error("ADDRESS_NOT_FOUND");

    Object.assign(address, updateData);
    await user.save();
    return user;
  }

  async removeAddress(userId, addressId) {
    const user = await this.findOrFail(userId, "USER_NOT_FOUND");
    user.addresses.pull(addressId);
    await user.save();
    return user;
  }
}

module.exports = new UserService(User);
