import Link from "next/link";
import { ListItemToggle } from "@/components/ListItemToggle";
import { siteConfig } from "@/lib/site-config";
import type { StoredList } from "@/lib/storage";

const who = (id: "marko" | "partner") =>
  id === "marko" ? siteConfig.partnerOne : siteConfig.partnerTwo;

/**
 * The one deliberately saturated band on the page. Everything else sits on the
 * single continuous surface; this is the loud note near the foot.
 */
export function Lists({ lists }: { lists: StoredList[] }) {
  if (lists.length === 0) return null;

  return (
    <section className="lists pad" id="lists">
      <div className="sechead">
        <h2>Bucketlists</h2>
        <Link className="more" href="/bucketlists">
          All lists →
        </Link>
      </div>

      <div className="listgrid">
        {lists.slice(0, 2).map((list) => {
          const done = list.items.filter((item) => item.done).length;

          return (
            <div className="list" key={list.id}>
              <h3>{list.name}</h3>
              <span className="count">
                {done} of {list.items.length} done
              </span>
              <ul>
                {list.items.slice(0, 4).map((item) => (
                  <ListItemToggle
                    key={item.id}
                    listId={list.id}
                    itemId={item.id}
                    text={item.text}
                    done={item.done}
                    who={who(item.addedBy)}
                  />
                ))}
              </ul>
              <p className="addrow">
                <Link href={`/bucketlists#${list.id}`}>Open the list →</Link>
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
