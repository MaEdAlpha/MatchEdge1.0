// import { Component, OnInit, ViewChild } from "@angular/core";
// import { MatSort, MatTableDataSource } from "@angular/material";

// import { CarTableDataService } from "./car-table-data.service";

// export class Group {
//   level = 0;
//   expanded = false;
//   totalCounts = 0;
// }

// export class Car {
//   id: string = "";
//   vin: string = "";
//   brand: string = "";
//   year: string = "";
//   color: string = "";
// }

// @Component({
//   selector: "app-root",
//   templateUrl: "./app.component.html",
//   styleUrls: ["./app.component.scss"]
// })
// export class AppComponent implements OnInit {
//   //Observable MatTableDataSource.
//   public dataSource = new MatTableDataSource<any | Group>([]);

//   columns: any[];

//   //field properties (id, vin, brand, year etc...)
//   displayedColumns: string[];
//   //field you want to group by 'brand' in this case. 'leagues' in your case.
//   groupByColumns: string[] = [];
//   allData: any[];
//   _allGroup: any[];

//   expandedCar: any[] = [];
//   expandedSubCar: Car[] = [];

//   @ViewChild(MatSort) sort: MatSort;

//   constructor(protected dataSourceService: CarTableDataService) {
//     this.columns = [ { field: "id" }, { field: "vin" },{ field: "brand" },{ field: "year" },{ field: "color" }];
//     this.displayedColumns = this.columns.map(column => column.field);
//     console.log(this.displayedColumns);
//     this.groupByColumns = ["brand"];
//   }

//   ngOnInit() {
//     this.dataSourceService.getAllData().subscribe(
//       (data: any) => {
//         data.data.forEach((item, index) => {
//           item.id = index + 1;
//         });
//         this.allData = data.data;
//         this.dataSource.data = this.getGroupList(
//           this.allData,
//           0,
//           this.groupByColumns
//         );
//         //a group listing by brand
//         //console.log(this.dataSource.data);
//         //all vehicle objects you want in each row
//         //console.log(this.allData);
//         //Column you want to groupByColumns
//         //console.log(this.groupByColumns);
//       },
//       (err: any) => console.log(err)
//     );
//   }

//   groupHeaderClick(row) {
//     if (row.expanded) {
//       row.expanded = false;
//       this.dataSource.data = this.getGroupList(
//         this.allData,
//         0,
//         this.groupByColumns
//       );
//     } else {
//       row.expanded = true;
//       this.expandedCar = row;
//       this.dataSource.data = this.addGroupsNew(
//         this._allGroup,
//         this.allData,
//         this.groupByColumns,
//         row
//       );
//     }
//   }

//   // getGroups(data: any[], groupByColumns: string[]): any[] {
//   //   return this.getGroupList(data, 0, groupByColumns);
//   // }

//   getGroupList(data: any[], level: number, groupByColumns: string[]): any[] {
//     //uniqueBy has a function as a parameter, and sets each brand of each vehicle object to a group object we define above
//      let groups = this.uniqueBy(
//       data.map(row => {
//         const result = new Group();
//         result.level = level + 1;
//         for (let i = 0; i <= level; i++) {
            //this is where we assign the vehicle object's brand to the group object's brand property
//           result[groupByColumns[i]] = row[groupByColumns[i]];
//           //result[brand] = row[brand];
//           //console.log(result[groupByColumns[i]]);
//         }
//         //console.log(result);
//         return result;
//       }),
//       JSON.stringify
//     );
//     //groups =
//     //brand: "Renault"
//     // expanded: false
//     // level: 1
//     // totalCounts: 0
//     // __proto__: Group
//     console.log(groups);

//     //brand
//     const currentColumn = groupByColumns[level];

//     let subGroups = [];
//     groups.forEach(group => {
//       //filter all data to matching brands, for each group. add total count to group property
//       const rowsInGroup = data.filter(
//         row => group[currentColumn] === row[currentColumn]
//       );
//       group.totalCounts = rowsInGroup.length;
//       this.expandedSubCar = [];
//     });
//     //alphabetize
//     groups = groups.sort((a: Car, b: Car) => {
//       const isAsc = "asc";
//       return this.compare(a.brand, b.brand, isAsc);
//     });
//     //asign groups to _allGroup for calling later on click() expand functionality.
//     this._allGroup = groups;
//     //returns an alphabetically organized group list
//     //console.log(this._allGroup);
//     return groups;
//   }

//   uniqueBy(a, key) {
//     const seen = {};
//     return a.filter(item => {
//       const k = key(item);
//       // key is JSON.stringify
//       // k = {"level":1,"expanded":false,"totalCounts":0,"brand":"Jaguar"}
//       //seen.hasOwnProperty(k)) passes each stringified object to filter whether that brand is registerd or not.
//       return seen.hasOwnProperty(k) ? false : (seen[k] = true);
//     });
//   }

//   addGroupsNew(
//     allGroup: any[],
//     data: any[],
//     groupByColumns: string[],
//     dataRow: any
//   ): any[] {
//     return this.getSublevelNew(allGroup, data, 0, groupByColumns, dataRow);
//   }
//   //returns subGroup()
//   getSublevelNew(
//     allGroup: any[],
//     data: any[],
//     level: number,
//     groupByColumns: string[],
//     dataRow: any
//   ): any[] {
//     if (level >= groupByColumns.length) {
//       return data;
//     }
//     //allGroup = is _allGroup which is organized, counted group[].
//     //data is all vehicle data you pulled from db
//     //level is 0
//     //currentColumn is 'brand'
//     //dataRow is the row in  (click) = "function(row)""
//     const currentColumn = groupByColumns[level];

//     let subGroups = [];
//     //console.log(allGroup);
//     allGroup.forEach(group => {
//       //filter all data specific to its brand.
//       const rowsInGroup = data.filter(
//         row => group[currentColumn] === row[currentColumn]
//       );

//       group.totalCounts = rowsInGroup.length;

//       if (group.brand == dataRow.brand.toString()) {
//         group.expanded = dataRow.expanded;
//         const subGroup = this.getSublevelNew(
//           allGroup,
//           rowsInGroup,
//           level + 1,
//           groupByColumns,
//           dataRow.brand.toString()
//         );
//         this.expandedSubCar = subGroup;
//         subGroup.unshift(group);
//         subGroups = subGroups.concat(subGroup);
//       } else {
//         subGroups = subGroups.concat(group);
//       }
//     });
//     return subGroups;
//   }

//   isGroup(index, item): boolean {
//     return item.level;
//   }

//   onSortData(sort: MatSort) {
//     let data = this.allData;
//     const index = data.findIndex(x => x["level"] == 1);
//     if (sort.active && sort.direction !== "") {
//       if (index > -1) {
//         data.splice(index, 1);
//       }

//       data = data.sort((a: Car, b: Car) => {
//         const isAsc = sort.direction === "asc";
//         switch (sort.active) {
//           case "id":
//             return this.compare(a.id, b.id, isAsc);
//           case "vin":
//             return this.compare(a.vin, b.vin, isAsc);
//           case "brand":
//             return this.compare(a.brand, b.brand, isAsc);
//           case "year":
//             return this.compare(a.year, b.year, isAsc);
//           case "color":
//             return this.compare(a.color, b.color, isAsc);
//           default:
//             return 0;
//         }
//       });
//     }
//     this.dataSource.data = this.addGroupsNew(
//       this._allGroup,
//       data,
//       this.groupByColumns,
//       this.expandedCar
//     );
//   }

//   private compare(a, b, isAsc) {
//     return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
//   }
// }
