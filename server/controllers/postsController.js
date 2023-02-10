import Joi from "joi";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

const postController = {
  async createPost(req, res, next) {
    const validationSchema = Joi.object({
      user: Joi.string().required(),
      prompt: Joi.string().required(),
      image: Joi.string().required(),
    });

    const { image, prompt } = req.body;
    const { _id: user } = req.user;
    const { error } = validationSchema.validate({ image, prompt, user });

    if (error) {
      return next(error);
    }

    try {
      const userDoc = await User.findById(user);

      if (!userDoc) {
        return next(CustomErrorHandler.notFound());
      }

      await Post.create({ image, prompt, user: userDoc?._id });
      res
        .status(201)
        .json({ success: "true", message: "Post created successfully" });
    } catch (err) {
      return next(err);
    }
  },

  async fetchAllPosts(req, res, next) {
    try {
      const page = req.query?.page || 1;
      const size = req.query?.size || 19;
      const skip = (page - 1) * size;
      const q = req.query?.q || "";

      // total count of posts of activated users only
      const filtered_posts_count = await Post.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $match: {
            $and: [
              { "user.deactivated": false },
              { prompt: { $regex: q, $options: "i" } },
            ],
          },
        },

        {
          $count: "count",
        },
      ]);

      let totalPages;

      if (filtered_posts_count.length) {
        const [{ count }] = filtered_posts_count;
        totalPages = Math.ceil(count / size);
      } else {
        totalPages = 0;
      }

      // posts of activated users of single page only

      const posts = await Post.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        // {
        //   $match: {
        //     "user.deactivated": false,
        //   },
        // },
        {
          $match: {
            $and: [
              { "user.deactivated": false },
              { prompt: { $regex: q, $options: "i" } },
            ],
          },
        },
        {
          $project: {
            "user.firstName": 1,
            "user.lastName": 1,
            "user.avatar": 1,
            prompt: 1,
            image: 1,
          },
        },
        {
          $sort: { _id: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: size,
        },
      ]);

      return res
        .status(200)
        .json({ success: true, posts, currPage: page, totalPages });
    } catch (err) {
      return next(err);
    }
  },

  async deletePost(req, res, next) {
    try {
      const { id } = req.params;
      await Post.findByIdAndDelete(id);
      return res
        .status(200)
        .json({ success: true, message: "Deleted successfully" });
    } catch (err) {
      return next(err);
    }
  },

  async fetchSingleUserPosts(req, res, next) {
    try {
      const page = req.query?.page || 1;
      const size = req.query?.size || 10;
      const skip = (page - 1) * size;
      const { id } = req.params;
      const posts = await Post.find({ user: id })
        .populate("user", ["firstName", "lastName", "avatar"])
        .sort({ _id: -1 })
        .skip(skip)
        .limit(size);

      const totalPages = Math.ceil(
        (await Post.find({ user: id }).countDocuments()) / size
      );
      return res
        .status(200)
        .json({ success: true, data: posts, currPage: page, totalPages });
    } catch (err) {
      return next(err);
    }
  },
};

export default postController;
