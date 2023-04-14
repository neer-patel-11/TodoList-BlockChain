var ToDoList = artifacts.require("ToDoList.sol");

module.exports = function(deployer) {
  deployer.deploy(ToDoList);
};