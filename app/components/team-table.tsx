import type { Team } from "~/processing";

export interface TeamTableProps {
  teams: Team[];
  onTeamDelete?: (team: Team) => void;
}

const TeamTable: React.FC<TeamTableProps> = (props) => {
  return (
    <table className="table-fixed">
      <colgroup>
        <col className="w-22"></col>
        <col className="w-64"></col>
        <col className="w-20"></col>
      </colgroup>
      <thead className="border-b-0.5 border-gray-200 text-left">
        <tr>
          <th className="py-1 px-3 font-medium">ID#</th>
          <th className="py-1 px-3 font-medium">Alias</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {props.teams.map((team, i) => (
          <tr key={team.id} className={i % 2 !== 0 ? "bg-gray-2" : ""}>
            <td className="py-1 px-3 tabular-nums">{team.id}</td>
            <td className="py-1 px-3">{team.alias || <i>None</i>}</td>
            <td className="py-1 px-3">
              <button className="text-red-6 hover:underline" onClick={() => props.onTeamDelete?.(team)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
      {props.teams.length === 0 && (
        <tfoot>
          <tr>
            <td colSpan={3} className="py-1 px-3 text-center text-sm">
              <i>No teams added yet</i>
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );
};

export default TeamTable;
