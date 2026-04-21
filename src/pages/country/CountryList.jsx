import React, { useContext, useEffect, useState } from "react";
import Layout from "../../layout/Layout";
import { ContextPanel } from "../../utils/ContextPanel";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import { MdEdit } from "react-icons/md";
import axios from "axios";
import BASE_URL from "../../base/BaseUrl";
import {
  CountryCreate,
  CountryEdit,
} from "../../components/buttonIndex/ButtonComponents";
import { ButtonCreate } from "../../components/common/ButtonCss";

const CountryList = () => {
  const [countryListData, setCountryListData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isPanelUp } = useContext(ContextPanel);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "0");

  const handleSearch = (value) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (value) {
          params.set("search", value);
        } else {
          params.delete("search");
        }
        params.set("page", "0");
        return params;
      },
      { replace: true },
    );
  };

  const handlePageChange = (currentPage) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        params.set("page", currentPage.toString());
        return params;
      },
      { replace: true },
    );
  };

  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        if (!isPanelUp) {
          navigate("/maintenance");
          return;
        }
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${BASE_URL}/api/panel-fetch-country-list`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setCountryListData(response.data?.country);
      } catch (error) {
        console.error("Error fetching country data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCountryData();
    setLoading(false);
  }, []);

  const columns = [
    {
      name: "country_name",
      label: "Country",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "country_code",
      label: "Country Code",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "country_status",
      label: "Status",
      options: {
        filter: false,
        sort: true,
      },
    },

    {
      name: "id",
      label: "Action",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (id) => {
          return (
            <div className="flex items-center space-x-2">
              {/* <MdEdit
                onClick={() => navigate(`/edit-country/${id}`)}
                title="edit"
                className="h-5 w-5 cursor-pointer"
              /> */}
              <CountryEdit
                onClick={() =>
                  navigate(`/edit-country/${id}?${searchParams.toString()}`)
                }
                className="h-5 w-5 cursor-pointer"
              />
            </div>
          );
        },
      },
    },
  ];

  const options = {
    selectableRows: "none",
    elevation: 0,
    responsive: "standard",
    viewColumns: true,
    download: true,
    print: true,
    searchText: searchQuery,
    page: page,
    filter: false,
    searchOpen: true,
    searchPlaceholder: "Search...",
    onSearchChange: (searchText) => handleSearch(searchText),
    onChangePage: (currentPage) => handlePageChange(currentPage),
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-center bg-white mt-5 p-2 rounded-lg space-y-4 md:space-y-0">
        <h3 className="text-center md:text-left text-lg md:text-xl font-bold">
          Country List
        </h3>

        {/* <Link
          to="/add-country"
          className="btn btn-primary text-center md:text-right text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-md"
        >
          + Add Country
        </Link> */}
        <CountryCreate
          onClick={() => navigate(`/add-country?${searchParams.toString()}`)}
          className={ButtonCreate}
        />
      </div>
      <div className="mt-5">
        <MUIDataTable
          data={countryListData ? countryListData : []}
          columns={columns}
          options={options}
        />
      </div>
    </Layout>
  );
};

export default CountryList;
