export default function AlbumPreview({ title, playlistId }) {
  return (
    <div>
      <div className="videoWrapper">
        <iframe
          title={title}
          src={`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/${playlistId}&amp;color=%23ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;show_teaser=true&amp;visual=false`}
        />
      </div>
    </div>
  )
}
