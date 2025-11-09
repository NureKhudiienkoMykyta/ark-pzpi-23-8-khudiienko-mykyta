import Recipe from "../models/recipe.model";
import Favorites from "../models/favorites.model";

// До рефакторингу
export const addToFavorites = async (req, res) => {
  try {
    const { recipe_id } = req.body;
    const user_id = req.user.id;

    if (user_id) {
      if (recipe_id) {
        const recipe = await Recipe.findByPk(recipe_id);

        if (recipe) {
          const existingFavorite = await Favorites.findOne({
            where: { user_id, recipe_id },
          });

          if (!existingFavorite) {
            const favorite = await Favorites.create({ user_id, recipe_id });
            return res.status(201).json({ message: "Added to favorites" });
          } else {
            return res.status(409).json({
              message: "Already in favorites",
            });
          }
        } else {
          return res.status(404).json({
            message: "Recipe not found",
          });
        }
      } else {
        return res.status(400).json({
          message: "Recipe ID is required",
        });
      }
    } else {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};
