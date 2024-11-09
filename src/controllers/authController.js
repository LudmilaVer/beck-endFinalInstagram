//authController.js

import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import generateToken from '../config/jwt.js';


// Генерация временного пароля
const generateTemporaryPassword = () => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};



// Регистрация пользователя
export const register = async (req, res) => {
  const { username, email, password, full_name } = req.body;

  try {
    // Проверка наличия пользователя с таким же email или именем пользователя
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email или именем уже существует' });
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание нового пользователя
    const user = new User({
      username,
      email,
      password: hashedPassword,
      full_name
    });

    await user.save();

    // Генерация токена
    const token = generateToken(user);

    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка регистрации', error: error.message });
  }
};


// Логин пользователя
export const login = async (req, res) => {
  const { emailOrUsername, password } = req.body;


  try {
    // Поиск пользователя по email или username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });


    if (!user) {
      return res.status(400).json({ message: 'Неверный email/имя пользователя или пароль' });
    }

    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.password);

    console.log("Совпадение пароля:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный email/имя пользователя или пароль' });
    }

    // Генерация токена
    const token = generateToken(user);
    // console.log("Совпадение логина:", token);


    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Ошибка при авторизации:", error);
    res.status(500).json({ message: 'Ошибка авторизации', error: error.message });
  }
};



//Запрос на сброс пароля
// export const requestPasswordReset = async (req, res) => {
//   const { email } = req.body;
//   console.log("Запрос на сброс пароля для:", email);

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: 'Пользователь с таким email не найден' });
//     }

//     const resetToken = crypto.randomBytes(32).toString('hex');
//     user.resetPasswordToken = resetToken;
//     user.resetPasswordExpires = Date.now() + 3600000; // 1 час
//     await user.save();

//     const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
//     await sendEmail({
//       to: user.email,
//       subject: 'Сброс пароля',
//       text: `Перейдите по ссылке для сброса пароля: ${resetUrl}`,
//     });

//     res.status(200).json({ message: 'Ссылка для сброса пароля отправлена на email' });
//   } catch (error) {
//     console.error("Ошибка отправки письма:", error);
//     res.status(500).json({ message: 'Ошибка отправки письма', error: error.message });
//   }
// };

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Токен недействителен или срок его действия истек' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Пароль успешно обновлен' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сброса пароля', error: error.message });
  }
};




// Запрос на сброс пароля
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  console.log("Запрос на сброс пароля для:", email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь с таким email не найден' });
    }

    // Генерация и хэширование временного пароля
    const tempPassword = generateTemporaryPassword();
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

    // Сохранение временного пароля в базе данных
    user.password = hashedTempPassword;
    user.resetPasswordToken = undefined; // сброс токена сброса, если был
    user.resetPasswordExpires = undefined; // сброс времени действия токена
    await user.save();

    // Отправка временного пароля в ответ
    res.status(200).json({ tempPassword });
  } catch (error) {
    console.error("Ошибка обновления пароля:", error);
    res.status(500).json({ message: 'Ошибка обновления пароля', error: error.message });
  }
};
