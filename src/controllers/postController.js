import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import getUserIdFromToken from "../utils/helpers.js";
import { v2 as cloudinary } from "cloudinary";
import stream from "stream";

// Получение всех постов пользователя
export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user_id: getUserIdFromToken(req) });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении постов" });
  }
};

// Создание нового поста
export const createPost = async (req, res) => {
  const userId = getUserIdFromToken(req);
  const { caption } = req.body;

  try {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    cloudinary.uploader.upload_stream({ resource_type: "image" }, async (error, result) => {
      if (error) {
        console.error("Ошибка загрузки на Cloudinary:", error);
        return res.status(500).json({ message: "Ошибка загрузки изображения" });
      }

      console.log("Cloudinary URL:", result.secure_url); // Лог URL изображения

      const post = new Post({
        user_id: userId,
        image_url: result.secure_url, // Использование URL Cloudinary
        caption,
        created_at: new Date(),
      });

      await post.save();

      // Теперь добавим пост в массив posts пользователя
      const user = await User.findById(userId);
      if (user) {
        user.posts.push(post._id); // Добавляем ID нового поста в массив posts пользователя
        user.posts_count += 1; // Увеличиваем счетчик постов
        await user.save(); // Сохраняем обновление пользователя
      }

      res.status(201).json(post);
    }).end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при создании поста", details: error.message });
  }
};




// Удаление поста
export const deletePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Пост не найден" });

    await Post.findByIdAndDelete(postId);

    const user = await User.findById(post.user_id);
    user.posts_count -= 1;
    await user.save();

    res.status(200).json({ message: "Пост удалён" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при удалении поста" });
  }
};

// Получение поста по ID
export const getPostById = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId).populate("user_id", "username");
    if (!post) return res.status(404).json({ error: "Пост не найден" });

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении поста" });
  }
};

// Обновление поста
export const updatePost = async (req, res) => {
  const { postId } = req.params;
  const { caption, image_url } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Пост не найден" });

    if (caption !== undefined) post.caption = caption;
    if (image_url !== undefined) post.image_url = image_url;

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при обновлении поста" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    // Добавляем created_at в список полей, извлекаемых для user_id
    const posts = await Post.find().populate('user_id', 'username profile_image created_at');
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении постов", details: error.message });
  }
};
