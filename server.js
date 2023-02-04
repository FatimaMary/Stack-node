const { request, response } = require("express");
const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", (request, response) => {
    const newStock = request.body;
    console.log("New Stock:" + newStock);

    let db = new sqlite3.Database("db/StockManagement.db");
    let insertQuery = "INSERT INTO StockTable(StockName) VALUES(?)";

    const values = [newStock.StockName];

    db.run(insertQuery, values, (err) => {
        if(err) {
            response.json({
                message: err.message,
            });
        } else {
            response.json({
                message: "Stock inserted Successfully"
            });
        }
    });
    db.close();
});

app.get("/", (request, response) => {
    let db = new sqlite3.Database("db/StockManagement.db");

    const selectQuery = "SELECT StockId, stockName, StockTotal FROM StockTable";
    db.all(selectQuery, [], (err, rows) => {
        if(err){
            response.json({
                message: err.message,
            });
        } else {
            const stockEntries = rows.map((singleStock) => {
                return {
                    StockId: singleStock.StockId,
                    StockName: singleStock.StockName,
                    StockTotal: singleStock.StockTotal
                };
            });
            response.json(stockEntries);
        }
    });
    db.close();
});

app.put("/", (request, response) => {
    const updatedStock = request.body;
    let db = new sqlite3.Database("db/StockManagement.db");

    const updatedData = [
        updatedStock.StockName, 
        updatedStock.StockTotal
    ];
    const stockId = updatedStock.StockId;

    const updatedQuery = "UPDATE StockTable SET StockName = ?, StockTotal = ? WHERE stockId = ?";
    const values = [...updatedData, stockId];

    db.run(updatedQuery, values, (err) => {
        if(err){
            response.json({
                message: err.message,
            });
        } else {
            response.json({
                message: "Stock Updated"
            });
        }
    });
    db.close();
})

app.delete("/", (request, response) => {
    const stockId = parseInt(request.body.StockId);
    let db = new sqlite3.Database("db/StockManagement.db");
    const values = [stockId];

    const deleteQuery = "DELETE FROM StockTable WHERE stockId = ?";

    db.run(deleteQuery, values, (err) => {
        if(err) {
            response.json({
                message: err.message,
            });
        } else {
            response.json({
                message: "Deleted Successfully"
            });
        }
    });
    db.close();
});

app.post("/activity", (request, response) => {
    const stockActivity = request.body;
    console.log(stockActivity);

    let db = new sqlite3.Database("db/StockManagement.db");
    let insertQuery = "INSERT INTO StockLog(StockId, Name, Activity, StockValue) VALUES(?, ?, ?, ?)";

    const updatedValue = stockActivity.Activity === 'checkout' ? (stockActivity.StockValue * -1) : (stockActivity.StockValue);

    const values = [
        stockActivity.StockId,
        stockActivity.Name,
        stockActivity.Activity,
        updatedValue
    ];

    db.run(insertQuery, values, (err) => {
        if(err) {
            response.json({
                message: err.message,
            });
        } else {
            const stockId = stockActivity.StockId;
            console.log("StackId: " + stockId);

            const selectQuery = "SELECT SUM(StockValue) FROM StockLog WHERE stockId = ?";

            db.all(selectQuery, [stockId], (err, rows) => {
                if(err){
                    response.json({
                        message: err.message,
                    });
                } else {
                    console.log(rows);
                    console.log("value: "+ rows[0]["SUM(StockValue)"])
                    const totalValue = rows[0]["SUM(StockValue)"];
                    console.log("totalValue: " + totalValue)
                    const updatedQuery = "UPDATE StockTable SET StockTotal = ? WHERE stockId = ?";

                    const values = [totalValue, stockId];
                    db.run(updatedQuery, values, (err) => {
                        if(err){
                            response.json({
                                message: err.message,
                            });
                        } else {
                            response.json ({
                                message: "stock updated"
                            });
                        }
                    });
                }
            });
        }
    });
    db.close();
})

app.listen(8001, () => {
    console.log('Start Listenting, use 8001');
});