import { d } from "node_modules/react-router/dist/development/route-data-BmvbmBej";
import { NavigateFunction } from "react-router-dom";

import { SortField, SortOrder } from "@/config";

export const navigatePage = (
    location: d,
    navigate: NavigateFunction,
    page: number,
    sortFiled?: SortField,
    sortOrder?: SortOrder,
) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("page", page.toString());
    if (sortFiled !== undefined) {
        searchParams.set("sort_field", sortFiled.toString());
    }
    if (sortOrder !== undefined) {
        searchParams.set("sort_order", sortOrder.toString());
    }
    navigate({
        pathname: location.pathname,
        search: searchParams.toString(),
    });
};
