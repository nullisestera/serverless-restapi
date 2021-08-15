require('dotenv').config({ path: './.env' });

const _ = require('lodash');
const validator = require('validator');
const connectToDatabase = require('./db');
const Note = require('./models/Note');

/**
 * Helper function
 * @param {*} statusCode
 * @param {*} message
 * @returns
 */
const createErrorResponse = (statusCode, message) => ({
  statusCode: statusCode || 501,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    error: message || 'An Error occurred.',
  }),
});
/**
 * 
 * @param {*} error Error message
 */
const returnError = (error) => {
  console.log(error);
  if (error.name) {
    const message = `Invalid ${error.path}: ${error.value}`;
    callback(null, createErrorResponse(400, `Error:: ${message}`));
  } else {
    callback(
      null,
      createErrorResponse(error.statusCode || 500, `Error:: ${error.name}`)
    );
  }
};
/**
 * Notes CURD functions parameters
 * @param {*} event data that's passed to the function upon execution
 *          - for get note by ID and delete will get the Note ID from the event
 * @param {*} context sets callbackWaitsForEmptyEventLoop false
 * @param {*} callback sends a response success or failure
 * @returns
 */
module.exports.create = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (_.isEmpty(event.body)) {
    return callback(null, createErrorResponse(400, 'Missing details'));
  }
  const { title, description, reminder, status, category } = JSON.parse(
    event.body
  );

  const noteObj = new Note({
    title,
    description,
    reminder,
    status,
    category,
  });

  if (noteObj.validateSync()) {
    return callback(null, createErrorResponse(400, 'Incorrect note details'));
  }

  try {
    await connectToDatabase();
    console.log(noteObj);
    const note = await Note.create(noteObj);
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(note),
    });
  } catch (error) {
    returnError(error);
  }
};

module.exports.getOne = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const id = event.pathParameters.id;
  if (!validator.isAlphanumeric(id)) {
    callback(null, createErrorResponse(400, 'Incorrect Id.'));
    return;
  }

  try {
    await connectToDatabase();
    const note = await Note.findById(id);

    if (!note) {
      callback(null, createErrorResponse(404, `No Note found with id: ${id}`));
    }

    callback(null, {
      statusCode: 200,
      body: JSON.stringify(note),
    });
  } catch (error) {
    returnError(error);
  }
};

module.exports.getAll = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    await connectToDatabase();
    const notes = await Note.find();
    if (!notes) {
      callback(null, createErrorResponse(404, 'No Notes Found.'));
    }

    callback(null, {
      statusCode: 200,
      body: JSON.stringify(notes),
    });
  } catch (error) {
    returnError(error);
  }
};
/**
 *
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @returns
 */
module.exports.update = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const data = JSON.parse(event.body);

  if (!validator.isAlphanumeric(event.pathParameters.id)) {
    callback(null, createErrorResponse(400, 'Incorrect Id.'));
    return;
  }

  if (_.isEmpty(data)) {
    return callback(null, createErrorResponse(400, 'Missing details'));
  }
  const { title, description, reminder, status, category } = data;

  try {
    await connectToDatabase();

    const note = await Note.findById(event.pathParameters.id);

    if (note) {
      note.title = title || note.title;
      note.description = description || note.description;
      note.reminder = reminder || note.reminder;
      note.status = status || note.status;
      note.category = category || note.category;
    }

    const newNote = await note.save();

    callback(null, {
      statusCode: 204,
      body: JSON.stringify(newNote),
    });
  } catch (error) {
    returnError(error);
  }
};
/**
 *
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @returns
 */
module.exports.delete = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const id = event.pathParameters.id;
  if (!validator.isAlphanumeric(id)) {
    callback(null, createErrorResponse(400, 'Incorrect Id.'));
    return;
  }
  try {
    await connectToDatabase();
    const note = await Note.findByIdAndRemove(id);
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        message: `Removed note with id: ${note._id}`,
        note,
      }),
    });
  } catch (error) {
    returnError(error);
  }
};