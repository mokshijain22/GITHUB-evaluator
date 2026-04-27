import { useEffect, useState } from "react";
import { GH_PROXY } from "../config";

function RepoPicker({ onSelect, onClose }) {
  const [repos, setRepos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => { load(1); }, []);

  async function load(p) {
    setLoading(true);
    try {
      const res = await fetch(GH_PROXY(`user/repos?sort=updated&per_page=50&page=${p}&affiliation=owner,collaborator`), { credentials:"include" });
      const data = await res.json();
      if (p===1) setRepos(data); else setRepos(r=>[...r,...data]);
      setHasMore(data.length===50); setPage(p);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  const filtered = repos.filter(r =>
    r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    (r.description||"").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="picker-ov" onClick={onClose}>
      <div className="picker-m" onClick={e=>e.stopPropagation()}>
        <div className="picker-hd"><span className="picker-ht">Select repository</span><button className="picker-cl" onClick={onClose}>×</button></div>
        <div className="picker-sw"><input autoFocus className="picker-si" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Filter repositories…"/></div>
        <div className="picker-li">
          {loading&&page===1?<div className="picker-em">Loading…</div>
          :filtered.length===0?<div className="picker-em">No repositories found</div>
          :filtered.map(r=>(
            <button key={r.id} className="picker-it" onClick={()=>onSelect(r)}>
              <div className="picker-itp"><span className="picker-nm">{r.full_name}</span>{r.private&&<span className="picker-prv">Private</span>}{r.language&&<span className="picker-lg">{r.language}</span>}</div>
              {r.description&&<div className="picker-ds">{r.description}</div>}
              <div className="picker-mt"><span>★ {r.stargazers_count}</span><span>{new Date(r.updated_at).toLocaleDateString()}</span></div>
            </button>
          ))}
          {hasMore&&!loading&&<button onClick={()=>load(page+1)} style={{width:'100%',padding:11,background:'none',border:'none',borderTop:'1px solid var(--border)',color:'var(--lav)',fontFamily:'var(--fd)',fontSize:11,cursor:'pointer'}}>Load more</button>}
        </div>
      </div>
    </div>
  );
}


export default RepoPicker;
