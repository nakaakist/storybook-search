import { ActionPanel, Action, List } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useMemo } from "react";

const BASE_URL = "http://localhost:6006/";

type Component = {
  id: string;
  title: string;
  name: string;
  importPath: string;
  tags: string[];
  type: string;
};

type IndexData = {
  entries: { [id: string]: Component };
};

export default function Command() {
  const { data, isLoading } = useFetch(new URL("index.json", BASE_URL).href);

  const componentsToShow = useMemo(() => {
    if (!data) return [];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return Object.entries((data as IndexData).entries).filter(([_, c]) => c.name === "Docs");
  }, [data]);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search components...">
      <List.Section title="Results">
        {componentsToShow.map(([id, component]) => (
          <SearchListItem key={id} component={component} />
        ))}
      </List.Section>
    </List>
  );
}

function SearchListItem({ component }: { component: Component }) {
  return (
    <List.Item
      title={component.title}
      keywords={[component.title, component.id]}
      actions={
        <ActionPanel title={component.title}>
          <ActionPanel.Section>
            <Action.OpenInBrowser url={`http://localhost:6006/?path=/story/${component.id}`} title="Storybookで開く" />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
