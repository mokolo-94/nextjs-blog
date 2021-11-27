import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "posts");

export function getSortedPostsData() {
  // Obtenez les noms de fichiers sous /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Supprimer ".md" du nom de fichier pour obtenir l'identifiant
    const id = fileName.replace(/\.md$/, "");

    // Lire le fichier de démarque sous forme de chaîne mais aussi Joignez tous les arguments ensemble et normalisez le chemin résultant.
    const fullPath = path.join(postsDirectory, fileName);
    //lire tout le contenu de maniere asynchrone et va prendre 2 parametre, le premier sera le path qui va determiner le chemin vers notre fichier et le second parametre est une option soit l'encodage
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Prend une chaîne ou un objet avec la propriété de contenu, extrait et analyse le premier plan de la chaîne, puis renvoie un objet avec des données, du contenu et d'autres propriétés utiles.
    const matterResult = matter(fileContents);

    // Combiner les données avec l'identifiant
    return {
      id,
      ...matterResult.data,
    };
  });
  // Trier les publications par date
  return allPostsData.sort(({ date: a }, { date: b }) => {
    if (a < b) {
      return 1;
    } else if (a > b) {
      return -1;
    } else {
      return 0;
    }
  });
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);

  // Renvoie un tableau qui ressemble à ceci
  // [
  //   {
  //     params: {
  //       id: 'ssg-ssr'
  //     }
  //   },
  //   {
  //     params: {
  //       id: 'pre-rendering'
  //     }
  //   }
  // ]
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ""),
      },
    };
  });
}

export async function getPostData(id) {
  //Joignez tous les arguments ensemble et normalisez le chemin résultant.
  const fullPath = path.join(postsDirectory, `${id}.md`);
  //lire tout le contenu de maniere asynchrone et va prendre 2 parametre, le premier sera le path qui va determiner le chemin vers notre fichier et le second parametre est une option soit l'encodage
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // analyse la section des métadonnées de publication
  const matterResult = matter(fileContents);

  // Utilisez la remarque pour convertir la démarque en chaîne HTML
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Combinez les données avec l'id et contentHtml
  return {
    id,
    contentHtml,
    ...matterResult.data,
  };
}
