const invModel = require("../models/vehicle-model")
const Util = {}

/* ************************
 *
 ************************** */
Util.getNav = async function () {
  let data = await invModel.getClassifications()
  let list = ""
  list += '<a class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300" href="/" title="Home page">Home</a>'
  data.rows.forEach((row) => {
    list +=
      '<a class="px-3 py-1 rounded hover:bg-gray-100" href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
  })
  return list
}

/* **************************************
* Build the classification view HTML (using Tailwind CSS)
* ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid
  if (data.length > 0) {
    grid = '<ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">'
    data.forEach(vehicle => {
      grid += '<li class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id
        + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
        + ' details"><img src="' + vehicle.inv_thumbnail
        + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
        + ' on CSE Motors" class="w-full h-48 object-cover" /></a>'
      grid += '<div class="p-4">'
      grid += '<hr class="border-t-2 border-blue-500 mb-3" />'
      grid += '<h2 class="text-xl font-semibold mb-2">'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details" class="text-gray-800 hover:text-blue-600">'
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span class="text-2xl font-bold text-green-600">$'
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else {
    grid += '<p class="text-center text-gray-600 text-lg py-8">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the vehicle detail view HTML (using Tailwind CSS)
* ************************************ */
Util.buildVehicleDetail = async function (vehicle) {
  let detail = '<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white p-6 rounded-lg shadow-lg">'

  // Vehicle image
  detail += '<div class="vehicle-image">'
  detail += '<img src="' + vehicle.inv_image + '" alt="' + vehicle.inv_year + ' '
    + vehicle.inv_make + ' ' + vehicle.inv_model + '" class="w-full h-auto rounded-lg shadow-md">'
  detail += '</div>'

  // Vehicle information
  detail += '<div class="vehicle-info space-y-4">'
  detail += '<h2 class="text-3xl font-bold text-gray-800">' + vehicle.inv_year + ' ' + vehicle.inv_make + ' ' + vehicle.inv_model + '</h2>'
  detail += '<p class="text-3xl font-bold text-green-600">$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</p>'
  detail += '<p class="text-gray-700 text-lg leading-relaxed">' + vehicle.inv_description + '</p>'
  detail += '<div class="border-t pt-4">'
  detail += '<h3 class="text-xl font-semibold mb-3 text-gray-800">Vehicle Specifications</h3>'
  detail += '<ul class="space-y-2">'
  detail += '<li class="flex"><span class="font-semibold w-32">Color:</span><span class="text-gray-700">' + vehicle.inv_color + '</span></li>'
  detail += '<li class="flex"><span class="font-semibold w-32">Miles:</span><span class="text-gray-700">' + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + '</span></li>'
  detail += '<li class="flex"><span class="font-semibold w-32">Type:</span><span class="text-gray-700">' + vehicle.classification_name + '</span></li>'
  detail += '</ul>'
  detail += '</div>'
  detail += '</div>'

  detail += '</div>'
  return detail
}

/* ****************************************
 * Build the classification list HTML
 * ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList = ""
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (classification_id != null && row.classification_id == classification_id) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  return classificationList
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util
