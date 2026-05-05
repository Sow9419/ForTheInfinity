import { Product } from '../types';

export const CATEGORIES: string[] = ['T-shirt', 'Pantalon', 'Jogin', 'La-Cost', 'Veste'];

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Jokin Noire',
    subtitle: 'For the Infinity',
    price: 24000,
    description: "Découvrez une destination mode où les tendances se fondent harmonieusement avec vos aspirations de style.",
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    tall: false,
  },
  {
    id: 2,
    name: 'Urban Street',
    subtitle: 'Streetwear Edition',
    price: 35000,
    description: "L'expression ultime du confort urbain. Des coupes audacieuses pour affirmer votre personnalité.",
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    tall: true,
  },
  {
    id: 3,
    name: 'Classic Elite',
    subtitle: 'Elegance Collection',
    price: 18000,
    description: "Redéfinissez les codes avec notre collection intemporelle. Des matières nobles pour une allure sophistiquée.",
    image: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    tall: true,
  },
  {
    id: 4,
    name: 'Summer Vibes',
    subtitle: 'Fresh look',
    price: 29000,
    description: "Légèreté et fraîcheur pour vos journées ensoleillées. Laissez-vous séduire par nos nouvelles couleurs.",
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    tall: false,
  },
  {
    id: 5,
    name: 'Veste Tech',
    subtitle: 'Performance Wear',
    price: 45000,
    description: "Protection et style. La veste indispensable pour affronter la ville avec élégance.",
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    tall: true,
  },
  {
    id: 6,
    name: 'Cargo Slim',
    subtitle: 'Utility Style',
    price: 22000,
    description: "Le pantalon cargo revisité avec une coupe slim moderne et des détails techniques.",
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    tall: false,
  },
];
