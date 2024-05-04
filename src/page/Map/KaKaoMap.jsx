import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Modal from "react-modal";
import FoodIndex from "../../components/FoodIndex";

Modal.setAppElement("#root");

const KakaoMap = () => {
  const [kakao, setKakao] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.onload = () => setKakao(window.kakao);
    script.src =
      "https://dapi.kakao.com/v2/maps/sdk.js?appkey=4d90cac7ec413eb4aec50eac7135504d&autoload=false";
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    fetch("http://localhost:3000/api/v1/restaurants")
      .then((response) => response.json())
      .then((data) => {
        // data가 배열이 아닌 객체이고, 실제 식당 데이터가 data.restaurants에 담겨있다고 가정
        if (data && Array.isArray(data.data)) {
          setRestaurants(data.data);
        } else {
          // data가 배열이 아니라면 배열로 바꿔준다.
          if (data && !Array.isArray(data)) {
            setRestaurants([data]);
          } else {
            console.error("Unexpected data format: ", data);
          }
        }
      });
  }, []);

  useEffect(() => {
    if (kakao) {
      kakao.maps.load(() => {
        const mapContainer = document.getElementById("map"),
          mapOption = {
            center: new kakao.maps.LatLng(36.350411, 127.384548), // 대전 중심 좌표
            level: 8,
          };

        const map = new kakao.maps.Map(mapContainer, mapOption);

        restaurants.forEach((restaurant) => {
          const markerPosition = new kakao.maps.LatLng(
            restaurant.latitude,
            restaurant.longitude
          );
          const marker = new kakao.maps.Marker({
            position: markerPosition,
          });

          kakao.maps.event.addListener(marker, "click", function () {
            setSelectedRestaurant(restaurant);
          });

          marker.setMap(map);
        });

        // 지도 이동 이벤트 리스너 등록
        kakao.maps.event.addListener(map, "dragend", function () {
          const center = map.getCenter();
          // 대전 중심 좌표보다 위도가 클 경우, 대전 중심 좌표로 되돌림
          if (center.getLat() > 36.350411) {
            map.setCenter(new kakao.maps.LatLng(36.350411, center.getLng()));
          }
        });
      });
    }
  }, [kakao, restaurants]);

  return (
    <Container>
      <MapContainer id="map" />
      {selectedRestaurant && (
        <Modal
          isOpen={true}
          onRequestClose={() => setSelectedRestaurant(null)} // 모달 닫기
          style={{
            overlay: {
              zIndex: 1000, // 모달이 가장 위에 표시되도록 zIndex 설정
              backgroundColor: "rgba(0, 0, 0, 0.5)", // 배경색 및 투명도 설정
            },
            content: {
              top: "50%", // 모달이 화면의 중앙에 위치하도록 top, left 조정
              left: "20%",
              transform: "translate(-50%, -50%)", // 모달을 화면의 중앙으로 이동
              width: "90%", // 모달의 너비 설정
              maxWidth: "600px", // 모달의 최대 너비 설정
              margin: "0 auto", // 가운데 정렬을 위해 margin 조정
              background: "linear-gradient(#e7e78b, #f0f0c3)", // 모달 배경색 설정
              borderRadius: "8px", // 모달 테두리 둥글게 설정
              padding: "20px", // 내용의 패딩 설정
              position: "relative", // 위치 설정
              border: "5px solid black", // 테두리 설정
            },
          }}
        >
          <FoodIndex restaurant={selectedRestaurant} />
          <CloseButton onClick={() => setSelectedRestaurant(null)}>
            X
          </CloseButton>
        </Modal>
      )}
    </Container>
  );
};

export default KakaoMap;

const Container = styled.div`
  width: 100%;
  height: calc(100vh - 60px); /* 해더의 높이를 제외한 나머지 영역 */
  padding: 3%;
  padding-left: 10%;
  padding-right: 10%;
  background: linear-gradient(#e7e78b, #f0f0c3);
`;

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  margin-right: 10%;
  border-radius: 30px;
  border: 5px solid black;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
`;