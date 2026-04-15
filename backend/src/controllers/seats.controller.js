import ApiResponse from "../utils/ApiResponse.js";
import { pool } from "../app.js";
import { ApiError } from "../utils/ApiError.js";

const getAllSeats = async (req, res) => {
  try {
    const result = await pool.query("select * from seats"); // equivalent to Seats.find() in mongoose
    return res.json(new ApiResponse(200, "Seats Found", result.rows));
  } catch (error) {
    throw new ApiError(404, "Seats Not found");
  }
};

const bookSeats = async (req, res) => {
  try {
    const id = req.user.id;
    console.log("Seat Number", req.body);

    const { seatNumber } = req.body;
    // payment integration should be here
    // verify payment
    const conn = await pool.connect(); // pick a connection from the pool
    //begin transaction
    // KEEP THE TRANSACTION AS SMALL AS POSSIBLE
    await conn.query("BEGIN");
    //getting the row to make sure it is not booked
    /// $1 is a variable which we are passing in the array as the second parameter of query function,
    // Why do we use $1? -> this is to avoid SQL INJECTION
    // (If you do ${id} directly in the query string,
    // then it can be manipulated by the user to execute malicious SQL code)
    const sql =
      "SELECT * FROM seats where seat_no = $1 AND is_booked = FALSE FOR UPDATE";
    const result = await conn.query(sql, [seatNumber]);

    //if no rows found then the operation should fail can't book
    // This shows we Do not have the current seat available for booking
    if (result.rowCount === 0) {
      throw new ApiError(404, "Seat already booked");
    }
    console.log("booking can be done");
    //if we get the row, we are safe to update
    const sqlU =
      "update seats set is_booked = TRUE, booked_by = $2 where seat_no = $1";
    const updateResult = await conn.query(sqlU, [seatNumber, id]); // Again to avoid SQL INJECTION we are using $1 and $2 as placeholders

    //end transaction by committing
    await conn.query("COMMIT");
    conn.release(); // release the connection back to the pool (so we do not keep the connection open unnecessarily)
    console.log("Booking done");
    return res.json(new ApiResponse(200, "Seat Booked", updateResult));
  } catch (ex) {
    await conn.query("ROLLBACK"); // ← add this!
    conn.release();
    console.log("Error in seat Booking", ex);
    throw new ApiError(500, "Error in Seat Booking");
  }
};

export { getAllSeats, bookSeats };
