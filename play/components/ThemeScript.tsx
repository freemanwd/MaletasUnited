export function ThemeScript() {
  const js = `try{var t=localStorage.getItem("maletas-theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t);}catch(e){}`;
  return (
    <script
      dangerouslySetInnerHTML={{ __html: js }}
      // Runs before paint so the stored light/dark choice does not flash.
    />
  );
}
