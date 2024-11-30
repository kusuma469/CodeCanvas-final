import { useOthers, useSelf } from "@liveblocks/react/suspense";
import styles from "./Avatars.module.css";

/*// Define the type for user info
interface UserInfo {
  picture?: string;
  name?: string;
}*/

// Update Avatar component to handle optional props
interface AvatarProps {
  picture?: string;
  name?: string;
}

export function Avatar({ picture, name }: AvatarProps) {
  // Provide default values if picture or name is undefined
  const defaultPicture = "https://via.placeholder.com/40";
  const defaultName = "Anonymous";

  return (
    <div className={styles.avatar} data-tooltip={name || defaultName}>
      <img
        src={picture || defaultPicture}
        className={styles.avatar_picture}
        data-tooltip={name || defaultName}
        alt={name || defaultName}
      />
    </div>
  );
}

export function Avatars() {
  const users = useOthers();
  const currentUser = useSelf();

  return (
    <div className={styles.avatars}>
      {users.map(({ connectionId, info }) => {
        return (
          <Avatar 
            key={connectionId} 
            picture={info?.picture} 
            name={info?.name} 
          />
        );
      })}
      {currentUser && (
        <div className="relative ml-8 first:ml-0">
          <Avatar
            picture={currentUser.info?.picture}
            name={currentUser.info?.name}
          />
        </div>
      )}
    </div>
  );
}