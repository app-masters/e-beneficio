import { Table } from 'antd';
import React, { useCallback, useMemo } from 'react';
import { NumberPicker } from '../numberPicker';

type IdType<IdName extends string> = {
  [I in IdName]: string | number;
};

export type ResourceSelectorDataSourceItem<IdName extends string> = {
  name: string;
  amount: number;
} & IdType<IdName>;

export type ResourceSelectorValueItem<IdName extends string> = {
  amount: number;
} & IdType<IdName>;

export type ResourceSelectorProps<IdName extends string> = {
  idName: IdName;
  title?: string;
  datasource: ResourceSelectorDataSourceItem<IdName>[];
  value: ResourceSelectorValueItem<IdName>[];
  onChange?: (value: ResourceSelectorValueItem<IdName>[]) => void;
  pagination?: boolean;
};

/**
 * Resource selector component
 * @param props component props
 */
export function ResourceSelector<IdName extends string = 'id'>({
  idName,
  title,
  datasource,
  value,
  onChange,
  pagination
}: ResourceSelectorProps<IdName>) {
  // Reset the state every time the datasource changes
  const resourceList = useMemo(
    () =>
      datasource.map((item) => ({
        [idName]: item[idName],
        name: item.name,
        amount: value.find((resource) => resource[idName] === item[idName])?.amount || 0
      })),
    [datasource, value, idName]
  );

  // Whenever a + or - button is clicked, send the updated list of resources to the onChange event
  const handleChangeAmount = useCallback(
    (id: string | number, amount: number) => {
      if (onChange) {
        onChange(
          resourceList
            .map((resource) =>
              resource[idName] === id
                ? { [idName]: id, amount }
                : { [idName]: resource[idName], amount: resource.amount }
            )
            .filter((resource) => resource.amount > 0) as ResourceSelectorValueItem<IdName>[]
        );
      }
    },
    [resourceList, onChange, idName]
  );

  return (
    <Table
      dataSource={resourceList}
      showHeader={!!title}
      pagination={pagination ? { pageSize: 5, showLessItems: true } : false}
      rowKey="id"
    >
      <Table.Column title={title} dataIndex="name" width="65%" ellipsis={true} />
      <Table.Column
        width="35%"
        render={(item: ResourceSelectorValueItem<IdName>) => {
          return <NumberPicker value={item.amount} onChange={(value) => handleChangeAmount(item[idName], value)} />;
        }}
      />
    </Table>
  );
}
