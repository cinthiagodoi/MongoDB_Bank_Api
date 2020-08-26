import mongoose from "mongoose";
import AccountsSchema from "../models/accountsModel.js";
import express from "express";

const Account = mongoose.model("accounts", AccountsSchema);

export class AccountsController {
  async deposit(req, res) {
    const findedAccount = await Account.findOneAndUpdate(
      {
        agencia: req.body.agencia,
        conta: req.body.conta,
      },

      { $inc: { balance: req.body.deposit } },
      { new: true }
    )
      .then((findedAccount) => {
        console.log(findedAccount);
        if (!findedAccount) {
          res.status(404).send("Conta ou Agencia incorretas");
        }
        res
          .status(200)
          .send(
            `Deposito realizado com sucesso, novo saldo ${findedAccount.balance}`
          );
      })
      .catch((err) => console.log(err));
  }

  async withdraw(req, res) {
    const withdraw = req.body.withdraw;

    if (withdraw <= 0) {
      res.status(404).send("Operacao invalida");
    }
    const findedAccount = await Account.findOneAndUpdate(
      {
        agencia: req.body.agencia,
        conta: req.body.conta,
        balance: { $gt: withdraw },
      },

      { $inc: { balance: -withdraw - 1 } },
      { runValidators: true, new: true }
    )
      .then((findedAccount) => {
        if (!findedAccount) {
          res.status(404).send("Conta ou Agencia incorretas");
        }
        res
          .status(200)
          .send(
            `Deposito realizado com sucesso, novo saldo ${findedAccount.balance}`
          );
      })
      .catch((err) => console.log(err));
  }

  async consultBalance(req, res) {
    const findedBalance = await Account.findOne({
      agencia: req.body.agencia,
      conta: req.body.conta,
    })
      .then((findedBalance) => {
        if (!findedBalance) {
          res.status(404).send("Conta ou Agencia incorretas");
        }
        res.status(200).send(`Saldo ${findedBalance.balance}`);
      })
      .catch((err) => console.log(err));
  }

  async deleteAccount(req, res) {
    let result = 0;

    await Account.find({}, (err, accounts) => {
      if (err) {
        res.status(500);
      }
      accounts.forEach((account) => {
        if (account.agencia === req.body.agencia) {
          result++;
        }
      });
    });

    const deletedAccount = await Account.findOneAndDelete({
      agencia: req.body.agencia,
      conta: req.body.conta,
    })
      .then((deletedAccount) => {
        if (!deletedAccount) {
          res.status(404).send("Conta ou Agencia incorretas");
        }
        res
          .status(200)
          .send(
            `Conta excluída com sucesso - contas ativas na agencia número ${
              req.body.agencia
            } : ${result - 1}`
          );
      })
      .catch((err) => res.status(500).send(err));
  }

  async transfer(req, res) {
    let sourceValue = [];
    let destinationValue = [];
    const { sourceAccount, destinationAccount, sendedValue } = req.body;

    await Account.findOne({ conta: destinationAccount }, (err, account) => {
      if (err) {
        res.status(500);
      }
      destinationValue.push(account);
      destinationValue[0].balance = destinationValue[0].balance + sendedValue;
      account.save();
    });

    const findedValue = await Account.findOne(
      { conta: sourceAccount },
      (err, account) => {
        if (err) {
          res.status(500);
        }

        sourceValue.push(account);
        if (sourceValue[0].agencia === destinationValue[0].agencia) {
          sourceValue[0].balance = sourceValue[0].balance - sendedValue;
        }
        sourceValue[0].balance = sourceValue[0].balance - sendedValue - 8;
        account.save();
      }
    )
      .then((findedValue) => {
        if (!findedValue) {
          res.status(404).send("Contas incorretas");
        }
        res
          .status(200)
          .send(
            `Transferencia realizada saldo atual: ${sourceValue[0].balance}`
          );
        console.log(destinationValue);
        console.log(sourceValue);
      })
      .catch((err) => res.status(500).send(err));
  }

  async average(req, res) {
    let arr = [];
    let balanceAverage = 0;

    const findedValues = await Account.find(
      { agencia: req.body.agencia },
      (err, accounts) => {
        accounts.forEach((account) => {
          arr.push(account.balance);
          balanceAverage = (arr.reduce((x, y) => x + y) / arr.length).toFixed(
            2
          );
        });
      }
    )
      .then((findedValue) => {
        if (!findedValue) {
          res.status(404).send("Contas incorretas");
        }
        res.status(200).send(`Média de saldos : ${balanceAverage}`);
      })
      .catch((err) => console.log(err));
  }

  lowestValues = async (req, res) => {
    let order = { balance: 1 };

    this.sortedAccounts(order, req, res);
  };

  biggerValues = async (req, res) => {
    let order = { balance: -1, name: 1 };

    this.sortedAccounts(order, req, res);
  };

  sortedAccounts = async (order, req, res) => {
    const { value } = req.body;
    return await Account.find({})
      .sort(order)
      .limit(value)
      .exec((err, data) => res.send(data));
  };

  async privateAgency(req, res) {
    const aggregateValues = await Account.aggregate([
      {
        $group: {
          _id: "$agencia",
          id: { $first: "$_id" },
          balance: { $max: "$balance" },
        },
      },
    ]).then(async (aggregateValues) => {
      await Account.updateMany(
        { _id: { $in: aggregateValues.map((o) => o.id) } },
        { $set: { agencia: 99 } },
        { multi: true, new: true }
      );
    });

    Account.find({ agencia: 99 }, (err, accounts) => {
      if (err) {
        res.status(500).send(err);
      }
      res.status(200).send(accounts);
    });
  }
}
