var createError = require("http-errors");
var express = require("express");
var cors = require("cors");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const handleErrors = require("./middlewares/handleErrors");
const connectDB = require("./config/database");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const resourceRouter =  require("./routes/resource");
const causeRouter = require("./routes/cause");
const eventRouter =  require("./routes/event");
const voluntaryRouter =  require("./routes/voluntary");
const paymentRouter = require("./routes/payment");

var app = express();
const port = process.env.PORT || 8000;
connectDB();
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static("client/build"));
app.use(express.static("public"))
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/resource", resourceRouter);
app.use("/api/cause", causeRouter);
app.use("/api/event", eventRouter);
app.use("/api/voluntary", voluntaryRouter);
app.use("/api/payment", paymentRouter);

// serve static assests in production
if (process.env.NODE_ENV === "production") {
    // set static folder
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    });
}
// catch 404 and forward to error handler
console.log(process.env.NODE_ENV);
app.use(function (req, res, next) {
    next(createError(404));
});
app.use(handleErrors);
app.listen(port, () => console.log(`Server started on port ${port}`));
