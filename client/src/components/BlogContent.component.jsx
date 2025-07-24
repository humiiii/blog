import React from "react";
import { FaQuoteLeft } from "react-icons/fa6";

const EditorJsRenderer = ({ blocks }) => {
  if (!blocks || !Array.isArray(blocks)) return null;

  const renderListItems = (items) =>
    items.map((item, index) => (
      <li
        key={index}
        dangerouslySetInnerHTML={{ __html: item.content }}
        className="my-4"
      />
    ));

  return (
    <>
      {blocks.map((block) => {
        const { id, type, data } = block;

        switch (type) {
          case "header": {
            const HeadingTag = `h${data.level >= 1 && data.level <= 6 ? data.level : 2}`;
            return (
              <HeadingTag
                key={id}
                dangerouslySetInnerHTML={{ __html: data.text }}
                className={
                  HeadingTag == "h2"
                    ? "my-6 text-4xl font-bold"
                    : "my-6 text-3xl font-bold"
                }
              />
            );
          }
          case "paragraph":
            return (
              <p key={id} dangerouslySetInnerHTML={{ __html: data.text }} />
            );
          case "image": {
            const imgClassNames = [
              data.withBorder ? "with-border" : "",
              data.withBackground ? "with-background" : "",
              data.stretched ? "stretched" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <figure key={id} className={`editorjs-image ${imgClassNames}`}>
                <img src={data.file.url} alt={data.caption || ""} />
                {data.caption && (
                  <figcaption className="text-dark-gray my-6 w-full text-center text-base md:mb-12">
                    {data.caption}
                  </figcaption>
                )}
              </figure>
            );
          }
          case "quote":
            return (
              <blockquote
                key={id}
                className={`quote align-${data.alignment || "left"} bg-purple/10 border-purple my-6 border-l-4 p-3 pl-5`}
              >
                <FaQuoteLeft className="mb-4" />

                <p
                  dangerouslySetInnerHTML={{ __html: data.text }}
                  className="text-xl leading-10 md:text-2xl"
                />
                {data.caption && (
                  <cite className="text-purple/70 w-full text-base">
                    {data.caption}
                  </cite>
                )}
              </blockquote>
            );
          case "list":
            if (data.style === "ordered") {
              return (
                <ol
                  key={id}
                  className="editorjs-list ordered-list list-decimal pl-5"
                >
                  {renderListItems(data.items)}
                </ol>
              );
            } else if (data.style === "unordered") {
              return (
                <ul
                  key={id}
                  className="editorjs-list unordered-list list-disc pl-5"
                >
                  {renderListItems(data.items)}
                </ul>
              );
            } else if (data.style === "checklist") {
              return (
                <ul key={id} className="editorjs-list checklist">
                  {data.items.map((item, idx) => (
                    <li key={idx}>
                      <input
                        type="checkbox"
                        checked={item.meta?.checked || false}
                        readOnly
                      />
                      <span
                        dangerouslySetInnerHTML={{ __html: item.content }}
                      />
                    </li>
                  ))}
                </ul>
              );
            }
            return null;
          default:
            return null;
        }
      })}
    </>
  );
};

export default EditorJsRenderer;
