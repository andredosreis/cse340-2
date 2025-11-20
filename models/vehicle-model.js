const pool = require("../database/connection")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM cse340.classification ORDER BY classification_name")
}

/* ***************************
 *  Get classification by ID
 * ************************** */
async function getClassificationById(classification_id) {
  try {
    const data = await pool.query(
      "SELECT * FROM cse340.classification WHERE classification_id = $1",
      [classification_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getClassificationById error " + error)
    return null
  }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM cse340.inventory AS i
      JOIN cse340.classification AS c
      ON i.classification_id = c.classification_id
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
    return [] // Return empty array instead of undefined
  }
}

/* ***************************
 *  Get specific vehicle by inventory id
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM cse340.inventory AS i
      JOIN cse340.classification AS c
      ON i.classification_id = c.classification_id
      WHERE i.inv_id = $1`,
      [inv_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getvehiclebyid error " + error)
    return null // Return null instead of undefined
  }
}

module.exports = { getClassifications, getClassificationById, getInventoryByClassificationId, getVehicleById }
