import { ActionPanel, Action, List, Detail } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useMemo } from "react";
import { IndexData, StoriesData, Component, Config } from "./types";
import EditConfig from "./edit-config";

const Search = ({ config }: { config: Config }) => {
  // Load Storybook's index file https://storybook.js.org/docs/react/configure/sidebar-and-urls#story-indexers
  const {
    data: index,
    isLoading: isLoadingIndex,
    error: indexError,
  } = useFetch<IndexData>(new URL("index.json", config.baseUrl).href, {
    onError: () => undefined, // prevent default toast
  });
  const {
    data: stories,
    isLoading: isLoadingStories,
    error: storiesError,
  } = useFetch<StoriesData>(new URL("stories.json", config.baseUrl).href, {
    onError: () => undefined, // prevent default toast
  });

  const componentsToShow = useMemo(() => toComponentsToShow({ index, stories, config }), [index, stories, config]);

  if (storiesError && indexError)
    return (
      <Detail
        markdown={`Error loading data from Storybook server.\n\nMake sure stories.json or index.json is served from ${config.baseUrl}.`}
        actions={
          <ActionPanel>
            <EditConfigAction />
          </ActionPanel>
        }
      />
    );

  return (
    <List
      isLoading={isLoadingStories || isLoadingIndex}
      searchBarPlaceholder="Search components..."
      actions={
        <ActionPanel>
          <EditConfigAction />
        </ActionPanel>
      }
    >
      {componentsToShow.map((component) => (
        <SearchListItem key={component.id} component={component} baseUrl={config.baseUrl} />
      ))}
    </List>
  );
};

const toComponentsToShow = ({
  index,
  stories,
  config,
}: {
  index?: IndexData;
  stories?: StoriesData;
  config: Config;
}): Component[] => {
  let nameFilterRegExp: RegExp;
  try {
    nameFilterRegExp = new RegExp(config.nameFilterRegExp ?? "");
  } catch {
    return [];
  }

  // filter by name and title
  const filter = (components: [string, Component][]) =>
    components.filter(([_, c]) => nameFilterRegExp.test(c.name)).map(([_, c]) => c);

  // index.json is the preferred source of truth
  if (index) return filter(Object.entries(index.entries));
  if (stories) return filter(Object.entries(stories.stories));

  return [];
};

const SearchListItem = ({ component, baseUrl }: { component: Component; baseUrl: string }) => {
  const title = `${component.title} - ${component.name}`;
  return (
    <List.Item
      title={title}
      keywords={[component.title, component.id]}
      actions={
        <ActionPanel title={title}>
          <ActionPanel.Section>
            <Action.OpenInBrowser
              url={new URL(`?path=/story/${component.id}`, baseUrl).href}
              title="Open in Storybook"
            />
            <Action.CopyToClipboard content={component.importPath} title="Copy Import Path" />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <EditConfigAction />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
};

const EditConfigAction = () => <Action.Push target={<EditConfig />} title="Edit Config" />;

export default Search;
