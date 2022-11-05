import { Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import TeamTable from "~/components/team-table";
import TextInput from "~/components/text-input";
import type { Team } from "~/processing";

const Index: React.FC = () => {
  const [teamToAddId, setTeamToAddId] = useState("");
  const [teamToAddAlias, setTeamToAddAlias] = useState("");

  const [teamIdError, setTeamIdError] = useState("");
  const [teamAliasError, setTeamAliasError] = useState("");

  const [teams, setTeams] = useState<Team[]>([]);

  const addTeam: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (!/^\d{2}-\d{4}$/.test(teamToAddId)) {
      setTeamIdError("Invalid team ID");
      return;
    }

    if (teams.some((team) => team.id === teamToAddId)) {
      setTeamIdError("Team already added");
      return;
    }

    setTeams((teams) => [
      ...teams,
      {
        id: teamToAddId,
        alias: teamToAddAlias,
      },
    ]);
    setTeamToAddId("");
    setTeamToAddAlias("");
  };

  const deleteTeam = (team: Team) => {
    setTeams((teams) => teams.filter((t) => t.id !== team.id));
  };

  useEffect(() => {
    const lsTeams = JSON.parse(localStorage.getItem("teams") ?? "[]");
    if (Array.isArray(lsTeams) && lsTeams.length > 0) {
      setTeams(lsTeams);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("teams", JSON.stringify(teams));
  }, [teams]);

  return (
    <div className="h-screen max-w-screen-lg mx-auto pt-2">
      <h1 className="text-size-3xl font-bold border-b pb-0.5 mb-4">CyberPatriot Dashboard Setup</h1>

      <div className="flex justify-center items-start space-x-6">
        <div className="w-fit shadow-md rounded-lg bg-white border-1 border-gray-200 mb-2">
          <h3 className="text-size-xl font-semibold px-3 py-1 border-b border-gray-200">Current Teams</h3>
          <div className="px-3 py-2">
            <TeamTable teams={teams} onTeamDelete={deleteTeam} />
          </div>
        </div>

        <div className="w-fit shadow-md rounded-lg bg-white border-1 border-gray-200 mb-2">
          <h3 className="text-size-xl font-semibold px-3 py-1 border-b border-gray-200">Add Team</h3>
          <div className="px-3 pt-1 pb-2">
            <form className="space-y-2" onSubmit={addTeam}>
              <TextInput
                className="w-32"
                label="ID#"
                placeholder="15-0000"
                maxLength={7}
                value={teamToAddId}
                onChange={(v) => {
                  setTeamIdError("");
                  setTeamToAddId(v);
                }}
                error={teamIdError}
              />
              <TextInput
                className="w-64"
                label="Alias"
                placeholder="The Lorem Ispums"
                maxLength={32}
                value={teamToAddAlias}
                onChange={(v) => {
                  setTeamAliasError("");
                  setTeamToAddAlias(v);
                }}
                error={teamAliasError}
              />
              <input
                type="submit"
                className="py-2 px-4 bg-emerald-500 hover:bg-emerald-400 font-medium rounded-md text-white cursor-pointer"
                value="Add"
              ></input>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t mt-4 pt-2">
        <Link
          className="py-2 px-4 bg-emerald-500 hover:bg-emerald-400 font-medium rounded-md text-white float-right"
          to="/dashboard"
        >
          Continue
        </Link>
      </div>
    </div>
  );
};

export default Index;
