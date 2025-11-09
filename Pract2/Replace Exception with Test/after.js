import Rating from "../models/rating.model";
import Recipe from "../models/recipe.model";

export const addRating = async (req, res) => {
  const { recipe_id, rating } = req.body;
  const user_id = req.user.user_id;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({
      error: "Оцінка повинна бути в діапазоні від 1 до 5",
    });
  }

  const recipe = await Recipe.findByPk(recipe_id, {
    attributes: ["recipe_id", "title", "image_url"],
  });

  if (!recipe) {
    return res.status(404).json({
      error: "Рецепт не знайдено",
    });
  }

  const existingRating = await Rating.findOne({
    where: {
      user_id: user_id,
      recipe_id: recipe_id,
    },
  });

  if (existingRating) {
    return res.status(400).json({
      error: "Ви вже оцінили цей рецепт",
      existing_rating: {
        rating_id: existingRating.rating_id,
        rating: existingRating.rating,
      },
    });
  }

  try {
    const newRating = await Rating.create({
      user_id: user_id,
      recipe_id: recipe_id,
      rating: rating,
    });

    const recipeRatings = await Rating.findAll({
      where: { recipe_id: recipe_id },
      attributes: ["rating"],
    });

    const total = recipeRatings.reduce((sum, r) => sum + r.rating, 0);
    const average_rating = Math.round((total / recipeRatings.length) * 10) / 10;

    res.status(201).json({
      message: "Оцінку успішно додано",
      rating: {
        rating_id: newRating.rating_id,
        rating: newRating.rating,
        created_at: newRating.createdAt,
      },
      recipe: {
        recipe_id: recipe.recipe_id,
        title: recipe.title,
        image_url: recipe.image_url,
        average_rating: average_rating,
        total_ratings: recipeRatings.length,
      },
    });
  } catch (error) {
    console.error("Неперевірена помилка при додаванні оцінки:", error);
    res.status(500).json({
      error: "Внутрішня помилка сервера",
    });
  }
};
