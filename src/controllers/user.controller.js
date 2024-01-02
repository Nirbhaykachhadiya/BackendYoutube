import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { userName, password, email, fullName } = req.body;
  console.log("Email :", email);

  if (userName === "") {
    throw new ApiError(400, "full Name is Required");
  }
  if (password === "") {
    throw new ApiError(400, "full Name is Required");
  }
  if (email === "") {
    throw new ApiError(400, "full Name is Required");
  }
  if (fullName === "") {
    throw new ApiError(400, "full Name is Required");
  }

  const exitedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (exitedUser) {
    throw new ApiError(409, "user already exits");
  }

  const avatarlocalpath = req.files?.avatar[0]?.path; //loacl ma multere store kryo hse
  console.log(avatarlocalpath);
  const coverimagelocalpath = req.files?.coverImage[0].path;
  console.log(coverimagelocalpath);
  if (!avatarlocalpath) {
    throw new ApiError(400, "avatar is must locally");
  }

  const avatar = await uploadOnCloudinary(avatarlocalpath);
  const coverImage = await uploadOnCloudinary(coverimagelocalpath);
  if (!avatar) {
    throw new ApiError(400, "avatar is must cloudnary");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: userName.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while register on db by us");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user register successfully"));
});

export { registerUser };
