import { ActionPanel, Action, List, Detail } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useMemo } from "react";

const BASE_URL = "http://localhost:6006/";

type Component = {
  id: string;
  title: string;
  name: string;
  importPath: string;
  tags: string[];
};

type IndexData = {
  entries: { [id: string]: Component };
};

type StoriesData = {
  stories: { [id: string]: Component };
};

const Command = () => {
  // Load Storybook's index file https://storybook.js.org/docs/react/configure/sidebar-and-urls#story-indexers
  const {
    data: index,
    isLoading: isLoadingIndex,
    error: indexError,
  } = useFetch<IndexData>(new URL("index.json", BASE_URL).href);
  const {
    data: stories,
    isLoading: isLoadingStories,
    error: storiesError,
  } = useFetch<StoriesData>(new URL("stories.json", BASE_URL).href);

  const componentsToShow = useMemo(() => toComponentsToShow(index, stories), [index, stories]);

  if (storiesError && indexError)
    return (
      <Detail
        markdown={`Error loading data from Storybook server.\n\nMake sure stories.json or index.json is served from ${BASE_URL}.`}
      />
    );

  return (
    <List isLoading={isLoadingStories || isLoadingIndex} searchBarPlaceholder="Search components...">
      {componentsToShow.map((component) => (
        <SearchListItem key={component.id} component={component} />
      ))}
    </List>
  );
};

const toComponentsToShow = (indexData?: IndexData, storiesData?: StoriesData): Component[] => {
  const filter = (components: [string, Component][]) =>
    components.filter(([_, c]) => c.name === "Docs").map(([_, c]) => c);

  // index.json is the preferred source of truth
  if (indexData) return filter(Object.entries(indexData.entries));
  if (storiesData) return filter(Object.entries(storiesData.stories));

  return [];
};

const SearchListItem = ({ component }: { component: Component }) => {
  return (
    <List.Item
      title={component.title}
      keywords={[component.title, component.id]}
      actions={
        <ActionPanel title={component.title}>
          <ActionPanel.Section>
            <Action.OpenInBrowser
              url={new URL(`?path=/story/${component.id}`, BASE_URL).href}
              title="Open in Storybook"
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
};

export default Command;
