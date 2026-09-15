import { Button } from "@/components/ui/button";
import { PersonTile } from "./person-title";
import { Mic, MonitorUp, Video, Volume2 } from "lucide-react";

export function VideoView(){return <div className="grid h-[420px] grid-cols-1 gap-3 sm:grid-cols-2"><PersonTile name="Alex Morgan" role="Interviewer · Connected" initials="AM" active/><PersonTile name="Jordan Lee" role="Candidate · Connected" initials="JL"/><div className="col-span-full flex justify-center gap-2"><Button variant="default" size="icon"><Mic/></Button><Button variant="outline" size="icon"><Video/></Button><Button variant="default" size="icon"><MonitorUp/></Button><Button variant="outline" size="icon"><Volume2/></Button></div></div>}