import React from 'react';
import { Menu } from 'antd';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

function LeftMenu(props) {
  return (
    <Menu mode={props.mode}>
    <Menu.Item key="mail">
      <a href="/">Home</a>
    </Menu.Item>
    <SubMenu title={<span>Category</span>}>
      <MenuItemGroup title="회원">
        <Menu.Item key="setting:1">회원목록</Menu.Item>
      </MenuItemGroup>
      <MenuItemGroup title="게시글">
        <Menu.Item key="setting:3"><a href="/community/WriteView">게시글 작성</a></Menu.Item>
      </MenuItemGroup>
    </SubMenu>
  </Menu>
  )
}

export default LeftMenu