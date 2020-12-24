const modelUsers = require("./model.users");
class Controllers {
  createUserTest = async (req, res, next) => {
    const user = await modelUsers.create(req.body);

    return res.status(201).send(user);
  };
}

module.exports = new Controllers();
