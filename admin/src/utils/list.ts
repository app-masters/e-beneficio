import moment from 'moment';

/**
 * Add and sorts items in a list
 * @param item the item to add
 * @param list the list to add to
 */
export const addToList = <ItemType extends { id?: number | string; createdAt?: number | Date | null }>(
  item: ItemType | null,
  list: ItemType[]
) => {
  if (item) {
    list = list.filter((listItem) => listItem.id !== item.id);
    list.unshift(item);
  }
  list = list.sort((a, b) => moment(b.createdAt as Date).diff(moment(a.createdAt as Date)));
  return list;
};
