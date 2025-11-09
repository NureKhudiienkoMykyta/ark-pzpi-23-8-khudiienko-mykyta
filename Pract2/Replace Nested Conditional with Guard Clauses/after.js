import Recipe from "../models/recipe.model";
import Favorites from "../models/favorites.model";

export const addToFavorites = async (req, res) => {
  try {
    const { recipe_id } = req.body;
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    if (!recipe_id) {
      return res.status(400).json({
        message: "Recipe ID is required",
      });
    }

    const recipe = await Recipe.findByPk(recipe_id);

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    const existingFavorite = await Favorites.findOne({
      where: { user_id, recipe_id },
    });

    if (existingFavorite) {
      return res.status(409).json({
        message: "Already in favorites",
      });
    }

    await Favorites.create({ user_id, recipe_id });
    res.status(201).json({ message: "Added to favorites" });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};
